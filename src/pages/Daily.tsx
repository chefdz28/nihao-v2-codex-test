import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, BookOpen, MessageSquare, HelpCircle, Check, X, ArrowRight, Loader2, PartyPopper, Mic } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLessons, fetchVocabulary, fetchSentences, fetchQuizQuestions, fetchUserProgress } from '@/lib/dataService';
import { firstIncompleteLesson, shuffle } from '@/lib/learning';
import AudioButton from '@/components/AudioButton';
import VoicePractice from '@/components/VoicePractice';
import MarkComplete from '@/components/MarkComplete';
import type { LessonRow, VocabRow, SentenceRow, QuizQuestionRow, QuizOption } from '@/types/supabase';

type Step = 'words' | 'sentences' | 'quiz' | 'done';

const getOptionText = (opt: QuizOption, lang: string) => {
  if (lang === 'ar' && opt.textAr) return opt.textAr;
  return opt.text ?? opt.textEn ?? '';
};

/**
 * V2 Daily Path: a short guided session — 5 words, 3 sentences, then a quick
 * quiz — built from the learner's current/next incomplete lesson. Works
 * logged-out too (falls back to the first lesson).
 */
export default function Daily() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [words, setWords] = useState<VocabRow[]>([]);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('words');

  // Quick quiz state
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // V2.9B: Arabic SEO title + meta for /daily
  useEffect(() => {
    document.title = 'التدريب اليومي — تعلّم الصينية كل يوم | NiHao';
    const desc = 'جلسة تدريب يومية قصيرة لتعلّم الصينية: 5 كلمات، جمل، تدريب نطق، واختبار سريع. ابنِ عادة تعلّم يومية مع NiHao.';
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
    m.setAttribute('content', desc);
    return () => { document.title = 'NiHao'; };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const lessons = await fetchLessons();
        let target: LessonRow | null = lessons[0] || null;
        if (user) {
          const progress = await fetchUserProgress(user.id);
          target = firstIncompleteLesson(lessons, progress);
        }
        if (!target) { setLoading(false); return; }
        setLesson(target);
        const [v, s, q] = await Promise.all([
          fetchVocabulary(target.id),
          fetchSentences(target.id),
          fetchQuizQuestions(target.id),
        ]);
        setWords(v.slice(0, 5));
        setSentences(s.slice(0, 3));
        setQuestions(shuffle(q as QuizQuestionRow[]).slice(0, 3));
      } catch (err) {
        console.error('Daily path load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const steps = useMemo(() => ([
    { key: 'words' as const, label: t('daily.words'), icon: BookOpen },
    { key: 'sentences' as const, label: t('daily.sentences'), icon: MessageSquare },
    { key: 'quiz' as const, label: t('daily.quiz'), icon: HelpCircle },
  ]), [t]);

  const answer = (id: string) => {
    if (selected !== null) return;
    setSelected(id);
    if (id === questions[qIndex].correct_option_id) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
      setSelected(null);
    } else {
      setStep('done');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="section-padding text-center py-20">
        <p className="text-white mb-4">{t('daily.noLesson')}</p>
        <Link to="/courses" className="btn-primary">{t('daily.backToCourses')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Sun className="text-[#f59e0b]" /> {t('daily.title')}
        </h1>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          {t('daily.lesson')}: <span className="text-white">{lesson.order_num}. {lang === 'ar' ? lesson.title_ar : lesson.title_en}</span>
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 my-6">
        {steps.map((s, i) => {
          const stepOrder: Step[] = ['words', 'sentences', 'quiz', 'done'];
          const isDone = stepOrder.indexOf(step) > i;
          const isActive = s.key === step;
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-semibold flex-1 justify-center ${
                isActive ? 'bg-[#FF3333] text-white' : isDone ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-white/[0.04] text-[#888]'
              }`}>
                {isDone ? <Check size={14} /> : <s.icon size={14} />} {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1: 5 words */}
      {step === 'words' && (
        <motion.div key="words" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {words.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('daily.empty')}</p>
          ) : words.map(w => (
            <div key={w.id} className="liquid-glass p-4 flex items-center gap-4">
              <span className="font-chinese text-3xl text-white w-24 shrink-0">{w.chinese}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#FF3333] font-semibold">{w.pinyin}</p>
                <p className="text-xs font-arabic" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{w.arabic}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{w.english}</p>
              </div>
              <AudioButton text={w.chinese} size="sm" />
            </div>
          ))}
          <div className="text-center pt-4">
            <button onClick={() => setStep('sentences')} className="btn-primary">{t('daily.continue')} <ArrowRight size={14} /></button>
          </div>
        </motion.div>
      )}

      {/* Step 2: 3 sentences */}
      {step === 'sentences' && (
        <motion.div key="sentences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {sentences.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('daily.empty')}</p>
          ) : sentences.map(s => (
            <div key={s.id} className="liquid-glass p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-chinese text-xl text-white">{s.chinese}</span>
                <AudioButton text={s.chinese} size="sm" />
              </div>
              <p className="text-sm text-[#a0a0a0] mb-1">{s.pinyin}</p>
              <p className="text-sm font-arabic" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{s.arabic}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{s.english}</p>
            </div>
          ))}
          <div className="text-center pt-4">
            <button onClick={() => setStep(questions.length > 0 ? 'quiz' : 'done')} className="btn-primary">{t('daily.continue')} <ArrowRight size={14} /></button>
          </div>
        </motion.div>
      )}

      {/* Step 3: quick quiz */}
      {step === 'quiz' && questions.length > 0 && (
        <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="liquid-glass p-6">
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>{qIndex + 1} / {questions.length}</p>
            <p className="text-lg text-white mb-1">{questions[qIndex].question_en}</p>
            <p className="text-sm font-arabic mb-5" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{questions[qIndex].question_ar}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {questions[qIndex].options.map(opt => {
                let cls = 'p-3 rounded-xl border text-left text-sm transition-all ';
                if (selected !== null) {
                  if (opt.id === questions[qIndex].correct_option_id) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
                  else if (opt.id === selected) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
                  else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
                } else {
                  cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]';
                }
                return (
                  <button key={opt.id} onClick={() => answer(opt.id)} disabled={selected !== null} className={cls}>
                    <span className="font-bold mr-2">{opt.id.toUpperCase()}.</span> {getOptionText(opt, lang)}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="flex items-center justify-between mt-5">
                <span className="flex items-center gap-2 text-sm">
                  {selected === questions[qIndex].correct_option_id
                    ? <><Check size={16} className="text-[#10b981]" /><span className="text-[#10b981]">{t('daily.correct')}</span></>
                    : <><X size={16} className="text-[#FF3333]" /><span className="text-[#FF3333]">{t('daily.incorrect')}</span></>}
                </span>
                <button onClick={nextQuestion} className="btn-primary text-sm py-2 px-4">
                  {qIndex < questions.length - 1 ? t('daily.continue') : t('daily.finish')} <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Done */}
      {step === 'done' && (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass p-10 text-center">
          <PartyPopper size={40} className="text-[#f59e0b] mx-auto mb-4" />
          <h3 className="font-display font-bold text-2xl text-white mb-2">{t('daily.doneTitle')}</h3>
          {questions.length > 0 && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {t('daily.quizScore')}: {score} / {questions.length}
            </p>
          )}

          {/* V2.9B: speaking practice (local-only) */}
          <div className="mb-6 text-right" dir="rtl">
            <p className="text-sm font-arabic font-bold text-white mb-2 flex items-center gap-2 justify-center"><Mic size={16} className="text-[#FF3333]" /> تدرّب على النطق</p>
            <p className="text-xs font-arabic mb-3 text-center" style={{ color: 'var(--color-text-tertiary)' }}>اقرأ كلمات اليوم بصوت واضح، سجّل واستمع لنفسك. التسجيل محلي فقط.</p>
            <VoicePractice />
          </div>

          {/* V2.9B: mark daily complete (slug = today's date) */}
          <div className="mb-6 flex justify-center">
            <MarkComplete type="daily" slug={new Date().toISOString().slice(0, 10)} score={questions.length > 0 ? score : undefined} />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={`/courses/${lesson.level_id}/${lesson.id}`} className="btn-primary text-sm">{t('daily.openLesson')}</Link>
            <Link to="/dashboard" className="btn-secondary text-sm">{t('daily.dashboard')}</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
