import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import { fetchLessons, fetchVocabulary, fetchSentences } from '@/lib/dataService';
import { fetchLessonGrammar } from '@/lib/grammarService';
import type { LessonRow, VocabRow, SentenceRow } from '@/types/supabase';
import type { GrammarPoint } from '@/types/grammar';

interface Slide {
  kind: 'intro' | 'vocab' | 'sentence' | 'grammar' | 'quiz';
  zh?: string; py?: string; ar?: string; en?: string;
  title?: string; sub?: string;
  pattern?: string;
  quizOptions?: string[]; quizCorrect?: string;
}

/**
 * V2.2.1 /present/:lessonId — classroom presentation mode: fullscreen-friendly
 * slides (intro → vocab → sentences → grammar → quick quiz) with big Chinese,
 * PinyinText, Arabic/English, audio, arrows + keyboard navigation.
 */
export default function Present() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [slides, setSlides] = useState<Slide[]>([]);
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizPicked, setQuizPicked] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!lessonId) { setLoading(false); return; }
      try {
        const lessons = await fetchLessons();
        const ls = lessons.find(l => l.id === lessonId) || null;
        setLesson(ls);
        const [vocab, sentences, grammar] = await Promise.all([
          fetchVocabulary(lessonId).catch(() => [] as VocabRow[]),
          fetchSentences(lessonId).catch(() => [] as SentenceRow[]),
          ls ? fetchLessonGrammar(lessonId, ls.order_num).then(g => g.points).catch(() => [] as GrammarPoint[]) : Promise.resolve([] as GrammarPoint[]),
        ]);
        const deck: Slide[] = [];
        if (ls) deck.push({ kind: 'intro', title: `${ls.order_num}. ${ls.title_en}`, sub: ls.title_ar });
        (vocab as VocabRow[]).slice(0, 10).forEach(v => deck.push({ kind: 'vocab', zh: v.chinese, py: v.pinyin, ar: v.arabic, en: v.english }));
        (sentences as SentenceRow[]).slice(0, 5).forEach(s => deck.push({ kind: 'sentence', zh: s.chinese, py: s.pinyin, ar: s.arabic, en: s.english }));
        (grammar as GrammarPoint[]).slice(0, 3).forEach(g => deck.push({ kind: 'grammar', title: g.title_en, sub: g.title_ar, pattern: g.pattern, ar: g.explanation_ar, en: g.explanation_en }));
        // quick quiz slide from vocab
        const vs = (vocab as VocabRow[]);
        if (vs.length >= 3) {
          deck.push({
            kind: 'quiz',
            zh: vs[0].chinese, py: vs[0].pinyin,
            quizOptions: [vs[0], vs[1], vs[2]].map(v => `${v.arabic} / ${v.english}`).sort((a, b) => a.localeCompare(b)),
            quizCorrect: `${vs[0].arabic} / ${vs[0].english}`,
          });
        }
        setSlides(deck);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  const next = useCallback(() => { setI(x => Math.min(slides.length - 1, x + 1)); setQuizPicked(null); }, [slides.length]);
  const prev = useCallback(() => { setI(x => Math.max(0, x - 1)); setQuizPicked(null); }, []);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  if (!lesson || slides.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white mb-4">{t('present.empty')}</p>
        <Link to="/teacher" className="btn-primary text-sm">{t('teacher.title')}</Link>
      </div>
    );
  }

  const s = slides[i];

  return (
    <div className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {lesson.order_num}. {isAr ? lesson.title_ar : lesson.title_en} · {i + 1}/{slides.length}
        </span>
        <Link to={`/courses/${lesson.level_id}/${lesson.id}`} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <X size={16} className="text-white" />
        </Link>
      </div>
      <div className="h-1 bg-white/5 shrink-0"><div className="h-full bg-[#FF3333] transition-all" style={{ width: `${((i + 1) / slides.length) * 100}%` }} /></div>

      {/* slide */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}
            className="text-center max-w-[900px] w-full">
            {s.kind === 'intro' && (
              <>
                <p className="text-7xl mb-6">📖</p>
                <h1 className="font-display font-black text-white" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>{s.title}</h1>
                <p className="text-3xl font-arabic text-white mt-3" dir="rtl">{s.sub}</p>
                <p className="text-sm mt-8" style={{ color: 'var(--color-text-tertiary)' }}>{t('present.hint')}</p>
              </>
            )}
            {(s.kind === 'vocab' || s.kind === 'sentence') && (
              <>
                <p className="font-chinese text-white leading-tight" style={{ fontSize: s.kind === 'vocab' ? 'clamp(5rem, 14vw, 11rem)' : 'clamp(2.5rem, 7vw, 5rem)' }}>{s.zh}</p>
                <PinyinText size="lg" className="text-center !text-2xl mt-4">{s.py}</PinyinText>
                <p className="text-3xl font-arabic text-white mt-3" dir="rtl">{s.ar}</p>
                {s.en && <p className="text-lg mt-1" style={{ color: 'var(--color-text-secondary)' }}>{s.en}</p>}
                <button onClick={() => play(s.zh!)} className="w-16 h-16 rounded-full bg-[#FF3333] hover:bg-[#ff5555] flex items-center justify-center mx-auto mt-8 transition-colors">
                  <Volume2 size={26} className="text-white" />
                </button>
              </>
            )}
            {s.kind === 'grammar' && (
              <>
                <h2 className="font-display font-bold text-3xl text-white mb-2">{s.title}</h2>
                <p className="text-xl font-arabic text-white mb-6" dir="rtl">{s.sub}</p>
                <p className="font-chinese text-5xl text-[#FF3333] mb-6">{s.pattern}</p>
                <p className="text-xl font-arabic leading-relaxed max-w-[700px] mx-auto" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? s.ar : s.en}</p>
              </>
            )}
            {s.kind === 'quiz' && (
              <>
                <p className="text-sm uppercase font-display font-bold text-[#f59e0b] mb-4">⚡ {t('present.quickQuiz')}</p>
                <p className="font-chinese text-white" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)' }}>{s.zh}</p>
                <button onClick={() => play(s.zh!)} className="text-[#888] hover:text-white mt-2 mb-6"><Volume2 size={20} className="inline" /></button>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  {s.quizOptions!.map(opt => {
                    let cls = 'px-6 py-4 rounded-2xl border text-xl font-arabic transition-all ';
                    if (quizPicked !== null) {
                      if (opt === s.quizCorrect) cls += 'border-[#10b981]/60 bg-[#10b981]/15 text-[#10b981]';
                      else if (opt === quizPicked) cls += 'border-[#FF3333]/60 bg-[#FF3333]/15 text-[#FF3333]';
                      else cls += 'border-white/10 text-[#888]';
                    } else cls += 'border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]';
                    return <button key={opt} onClick={() => setQuizPicked(opt)} className={cls}>{opt}</button>;
                  })}
                </div>
                {quizPicked === s.quizCorrect && <PinyinText size="lg" className="text-center mt-4">{s.py}</PinyinText>}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="flex items-center justify-center gap-4 pb-8 shrink-0">
        <button onClick={prev} disabled={i === 0} className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-25 flex items-center justify-center transition-colors">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button onClick={next} disabled={i === slides.length - 1} className="w-14 h-14 rounded-full bg-[#FF3333] hover:bg-[#ff5555] disabled:opacity-25 flex items-center justify-center transition-colors">
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}
