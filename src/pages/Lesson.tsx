import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import PinyinText from '@/components/PinyinText';
import { awardXP, trackActivity, XP_REWARDS } from '@/lib/gamification';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, X, Clock, Target, ArrowRight, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { upsertUserProgress } from '@/lib/dataService';
import AudioButton from '@/components/AudioButton';
import FlashcardDeck from '@/components/FlashcardDeck';
import ListeningPractice from '@/components/ListeningPractice';
import WritingPad from '@/components/WritingPad';
import GrammarSection from '@/components/GrammarSection';
import type { LessonRow, VocabRow, SentenceRow, QuizQuestionRow, QuizOption } from '@/types/supabase';

export default function Lesson() {
  const { t } = useI18n(); // i18n context available for child components
  const { user } = useAuth();
  const { lessonId } = useParams<{ levelId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [prevLesson, setPrevLesson] = useState<LessonRow | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonRow | null>(null);
  const [completing, setCompleting] = useState(false);
  const [vocabulary, setVocabulary] = useState<VocabRow[]>([]);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Exercise state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const getOptionText = (opt: QuizOption | undefined) => {
    if (!opt) return '';
    return opt.text ?? opt.textEn ?? '';
  };

  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [savingResult, setSavingResult] = useState(false);

  const [activeTab, setActiveTab] = useState<'vocab' | 'sentences' | 'grammar' | 'flashcards' | 'writing' | 'listening' | 'exercise'>('vocab');

    useEffect(() => {
    if (!lessonId) return;
    loadLesson(lessonId);
  }, [lessonId]);

  async function loadLesson(id: string) {
    setLoading(true);
    setError('');
    try {
      const { data: lessonData } = await supabase.from('lessons').select('*').eq('id', id).single();
      if (!lessonData) { setError('Lesson not found'); setLoading(false); return; }
      setLesson(lessonData);
      trackEvent('start_lesson', { content_slug: id });

      const { data: neighborLessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('level_id', lessonData.level_id)
        .order('order_num');

      const orderedLessons = neighborLessons || [];
      const currentIndex = orderedLessons.findIndex(l => l.id === lessonData.id);
      setPrevLesson(currentIndex > 0 ? orderedLessons[currentIndex - 1] : null);
      setNextLesson(currentIndex >= 0 && currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null);

      const [vData, sData, qData] = await Promise.all([
        supabase.from('vocabulary').select('*').eq('lesson_id', id).order('order_num'),
        supabase.from('sentences').select('*').eq('lesson_id', id).order('order_num'),
        supabase.from('quiz_questions').select('*').eq('lesson_id', id).order('order_num'),
      ]);

      setVocabulary(vData.data || []);
      setSentences(sData.data || []);
      setQuestions(qData.data || []);

      // Track progress
      if (user) {
        await upsertUserProgress({
          user_id: user.id,
          lesson_id: id,
          status: 'in_progress',
          completion_percentage: 0,
        });
      }
    } catch (err) {
      setError('Failed to load lesson');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAnswer = (optionId: string) => {
    if (showFeedback || questions.length === 0) return;
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    if (optionId === questions[currentQuestion].correct_option_id) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
      // Save result
      if (user && lessonId) {
        setSavingResult(true);
        try {
          const passed = score >= Math.ceil(questions.length * 0.7);
          await supabase.from('quiz_results').insert({
            user_id: user.id,
            lesson_id: lessonId,
            score,
            total_questions: questions.length,
            passed,
          });
          await upsertUserProgress({
            user_id: user.id,
            lesson_id: lessonId,
            status: passed ? 'completed' : 'in_progress',
            completion_percentage: passed ? 100 : Math.round((score / questions.length) * 100),
            quiz_score: Math.round((score / questions.length) * 100),
          });
        } catch (err) {
          console.error('Failed to save quiz result:', err);
        } finally {
          setSavingResult(false);
        }
      }
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;

    try {
      setCompleting(true);
      // V2.1: XP + mission tracking (once per lesson)
      if (awardXP(`lesson_complete:${lesson.id}`, XP_REWARDS.lesson_complete) > 0) trackActivity('lessons_done');
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lesson.id,
            status: 'completed',
            completion_percentage: 100,
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,lesson_id' });
      }

      if (nextLesson) {
        navigate(`/courses/${lesson.level_id}/${nextLesson.id}`);
      } else {
        navigate('/courses');
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      if (nextLesson) {
        navigate(`/courses/${lesson.level_id}/${nextLesson.id}`);
      }
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> Loading lesson...</div>
      </div>
    );
}

  if (error || !lesson) {
    return (
      <div className="section-padding text-center">
        <h2 className="font-display font-bold text-2xl text-white mb-4">{error || 'Lesson not found'}</h2>
        <Link to="/courses" className="btn-primary">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
        <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={14} /> Courses
        </Link>
        <span>/</span>
        <span className="text-white">{lesson.title_en}</span>
      </div>

      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-white mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 0.9 }}>{lesson.title_en}</h1>
        <h2 className="font-arabic text-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>{lesson.title_ar}</h2>
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          <span className="flex items-center gap-1"><Clock size={14} /> {lesson.estimated_minutes} min</span>
          <span className="flex items-center gap-1"><Target size={14} /> {vocabulary.length} words</span>
          <span className="flex items-center gap-1">{sentences.length} sentences</span>
          <span className="flex items-center gap-1">{questions.length} questions</span>
        </div>
        {lesson.objective_en && (
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{lesson.objective_en}</p>
        )}

        {lesson.image_url && (
          <div className="mt-4 mb-5 rounded-2xl overflow-hidden border border-white/10 max-w-xl mx-auto bg-[#0b0b0b]">
            <img
              src={lesson.image_url}
              alt={lesson.title_en}
              className="w-full h-[220px] md:h-[250px] object-contain block bg-[#0b0b0b]"
              loading="lazy"
            />
          </div>
        )}

        {(lesson.explanation_en || lesson.explanation_ar) && (
          <div className="liquid-glass p-6 mt-5 border border-[#FF3333]/20 max-w-4xl">
            <h3 className="text-white font-display font-bold text-xl mb-4 text-right font-arabic">
              شرح مبسط
            </h3>

            {lesson.explanation_ar && (
              <p className="text-base md:text-lg leading-9 font-arabic mb-4 text-right" dir="rtl" style={{ color: '#e5e5e5' }}>
                {lesson.explanation_ar}
              </p>
            )}

            {lesson.explanation_en && (
              <p className="text-sm md:text-base leading-7 max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                {lesson.explanation_en}
              </p>
            )}
          </div>
        )}
      </motion.div>
        {/* V2.2.1: lesson video placeholder (future Paddoo-generated media) */}
        <div className="liquid-glass p-4 mb-6 flex items-center gap-4 rounded-2xl border border-white/5">
          <div className="w-16 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-2xl shrink-0">🎬</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-bold text-white">{t('lesson.videoTitle')}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t('lesson.videoSoon')}</p>
          </div>
        </div>


      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'vocab' as const, label: t('lesson.tab.vocab'), count: vocabulary.length },
          { key: 'sentences' as const, label: t('lesson.tab.sentences'), count: sentences.length },
          { key: 'grammar' as const, label: t('lesson.tab.grammar') },
          { key: 'flashcards' as const, label: t('lesson.tab.flashcards') },
          { key: 'writing' as const, label: t('lesson.tab.writing') },
          { key: 'listening' as const, label: t('lesson.tab.listening') },
          { key: 'exercise' as const, label: t('lesson.tab.quiz'), count: questions.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-3 rounded-xl font-display font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-[#FF3333] text-white' : 'bg-white/[0.03] text-[#a0a0a0] hover:text-white hover:bg-white/[0.06]'}`}>
            {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-70">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'vocab' && (
          <motion.div key="vocab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {vocabulary.length === 0 ? (
              <p className="text-white text-center py-8">{t('lesson.noVocab')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-display font-semibold text-[#a0a0a0]">Chinese</th>
                      <th className="text-left py-3 px-4 text-xs font-display font-semibold text-[#a0a0a0]">Pinyin</th>
                      <th className="text-left py-3 px-4 text-xs font-display font-semibold text-[#a0a0a0]">Arabic</th>
                      <th className="text-left py-3 px-4 text-xs font-display font-semibold text-[#a0a0a0]">English</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocabulary.map((v) => (
                      <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-chinese text-2xl text-white">{v.chinese}</td>
                        <td className="py-4 px-4"><PinyinText inline>{v.pinyin}</PinyinText></td>
                        <td className="py-4 px-4 font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{v.arabic}</td>
                        <td className="py-4 px-4" style={{ color: 'var(--color-text-secondary)' }}>{v.english}</td>
                        <td className="py-4 px-4"><AudioButton text={v.chinese} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'sentences' && (
          <motion.div key="sentences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {sentences.length === 0 ? (
              <p className="text-white text-center py-8">{t('lesson.noSentences')}</p>
            ) : (
              sentences.map(s => (
                <div key={s.id} className="liquid-glass p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-chinese text-xl text-white">{s.chinese}</span>
                    <AudioButton text={s.chinese} size="sm" />
                  </div>
                  <PinyinText size="base" className="mb-1">{s.pinyin}</PinyinText>
                  <p className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{s.arabic}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{s.english}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'grammar' && lesson && (
          <motion.div key="grammar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GrammarSection lessonId={lesson.id} lessonOrderNum={lesson.order_num} />
          </motion.div>
        )}

        {activeTab === 'flashcards' && (
          <motion.div key="flashcards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <FlashcardDeck vocabulary={vocabulary} srsDeck={lessonId || undefined} />
          </motion.div>
        )}

        {activeTab === 'writing' && (
          <motion.div key="writing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <WritingPad vocabulary={vocabulary} />
          </motion.div>
        )}

        {activeTab === 'listening' && (
          <motion.div key="listening" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ListeningPractice vocabulary={vocabulary} sentences={sentences} />
          </motion.div>
        )}

        {activeTab === 'exercise' && (
          <motion.div key="exercise" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {questions.length === 0 ? (
              <p className="text-white text-center py-8">{t('lesson.noQuiz')}</p>
            ) : quizComplete ? (
              <div className="liquid-glass p-10 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${score >= Math.ceil(questions.length * 0.7) ? 'bg-[#10b981]/15' : 'bg-[#FF3333]/15'}`}>
                  <span className={`font-display font-black text-3xl ${score >= Math.ceil(questions.length * 0.7) ? 'text-[#10b981]' : 'text-[#FF3333]'}`}>
                    {Math.round((score / questions.length) * 100)}%
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-2">Quiz Complete!</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  You got {score} out of {questions.length} correct
                </p>
                {savingResult && <p className="text-xs text-[#f59e0b] mb-4">Saving result...</p>}
                <div className="flex gap-3 justify-center mt-6">
                  <Link to="/courses" className="btn-secondary"><ChevronLeft size={14} /> Back to Courses</Link>
                  <Link to="/dashboard" className="btn-primary"><ArrowRight size={14} /> Dashboard</Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Question {currentQuestion + 1} of {questions.length}</span>
                  <div className="flex-1 mx-4 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#FF3333] transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
                  </div>
                </div>

                <div className="liquid-glass p-8 mb-6">
                  <p className="text-lg text-white mb-2">{questions[currentQuestion].question_en}</p>
                  <p className="text-sm font-arabic mb-6" style={{ color: 'var(--color-text-secondary)' }}>{questions[currentQuestion].question_ar}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questions[currentQuestion].options.map(opt => {
                      let btnClass = 'w-full p-4 rounded-xl border text-left transition-all ';
                      if (showFeedback) {
                        if (opt.id === questions[currentQuestion].correct_option_id) btnClass += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
                        else if (opt.id === selectedAnswer) btnClass += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
                        else btnClass += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
                      } else {
                        btnClass += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-[#FF3333]/30';
                      }
                      return (
                        <button key={opt.id} onClick={() => handleAnswer(opt.id)} disabled={showFeedback} className={btnClass}>
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-display font-bold text-sm">{opt.id.toUpperCase()}</span>
                            <span className="text-white text-base font-medium" style={{ color: "#ffffff", display: "inline-block" }}>{getOptionText(opt)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showFeedback && (
                    <motion.div className="mt-6 flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex items-center gap-2">
                        {selectedAnswer === questions[currentQuestion].correct_option_id ? (
                          <><Check size={20} className="text-[#10b981]" /><span className="text-[#10b981]">Correct!</span></>
                        ) : (
                          <><X size={20} className="text-[#FF3333]" /><span className="text-[#FF3333]">Incorrect. Correct answer: {questions[currentQuestion].correct_option_id.toUpperCase()}</span></>
                        )}
                      </div>
                      <button onClick={nextQuestion} className="btn-primary" disabled={savingResult}>
                        {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'} <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* V2: single lesson action bar — Previous / Complete / Next / Back to Courses */}
      <div className="mt-10 mb-8 max-w-4xl mx-auto">
        <div className="liquid-glass p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {prevLesson ? (
              <Link to={`/courses/${lesson.level_id}/${prevLesson.id}`} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors text-center">
                ← {t('lesson.prev')}
              </Link>
            ) : (
              <span className="px-5 py-3 rounded-xl bg-white/5 text-[#555] text-sm font-bold text-center select-none">
                ← {t('lesson.prev')}
              </span>
            )}
            {nextLesson ? (
              <Link to={`/courses/${lesson.level_id}/${nextLesson.id}`} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors text-center">
                {t('lesson.next')} →
              </Link>
            ) : (
              <span className="px-5 py-3 rounded-xl bg-white/5 text-[#555] text-sm font-bold text-center select-none">
                {t('lesson.next')} →
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/courses" className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors text-center">
              {t('lesson.backToCourses')}
            </Link>
            <Link to={`/present/${lesson.id}`} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors text-center">
              📽 {t('teacher.presentMode')}
            </Link>
            <Link to={`/worksheet/${lesson.id}`} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors text-center">
              🖨 {t('worksheet.print')}
            </Link>
            <button onClick={handleCompleteLesson} disabled={completing} className="btn-primary px-6 py-3 text-sm font-bold disabled:opacity-60">
              {completing ? t('lesson.completing') : '✓ ' + t('lesson.completeBtn')}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
