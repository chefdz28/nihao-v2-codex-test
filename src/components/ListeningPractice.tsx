import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import { shuffle } from '@/lib/learning';
import type { VocabRow, SentenceRow } from '@/types/supabase';

interface ListeningPracticeProps {
  vocabulary: VocabRow[];
  sentences?: SentenceRow[];
  maxQuestions?: number;
}

interface ListeningQuestion {
  chinese: string;
  correct: string;            // correct meaning (English)
  correctAr: string;          // correct meaning (Arabic)
  options: { en: string; ar: string }[];
}

/**
 * V2 Listening practice: plays Chinese TTS audio, the learner picks the
 * correct meaning. Local scoring only — no API needed.
 */
export default function ListeningPractice({ vocabulary, sentences = [], maxQuestions = 8 }: ListeningPracticeProps) {
  const { t, lang } = useI18n();
  const { play } = useAudio();

  const questions: ListeningQuestion[] = useMemo(() => {
    const pool = [
      ...vocabulary.map(v => ({ chinese: v.chinese, en: v.english, ar: v.arabic })),
      ...sentences.map(s => ({ chinese: s.chinese, en: s.english, ar: s.arabic })),
    ].filter(p => p.chinese && p.en);
    if (pool.length < 2) return [];
    return shuffle(pool).slice(0, maxQuestions).map(item => {
      const distractors = shuffle(pool.filter(p => p.en !== item.en)).slice(0, 3);
      const options = shuffle([
        { en: item.en, ar: item.ar },
        ...distractors.map(d => ({ en: d.en, ar: d.ar })),
      ]);
      return { chinese: item.chinese, correct: item.en, correctAr: item.ar, options };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabulary, sentences, maxQuestions]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0); // bump to reshuffle via key

  const q = questions[index];

  const choose = (en: string) => {
    if (selected !== null || !q) return;
    setSelected(en);
    if (en === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setRound(r => r + 1);
  };

  if (questions.length === 0) {
    return <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('listening.empty')}</p>;
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="liquid-glass p-10 text-center max-w-md mx-auto">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 70 ? 'bg-[#10b981]/15' : 'bg-[#FF3333]/15'}`}>
          <span className={`font-display font-black text-2xl ${pct >= 70 ? 'text-[#10b981]' : 'text-[#FF3333]'}`}>{pct}%</span>
        </div>
        <h3 className="font-display font-bold text-xl text-white mb-2">{t('listening.done')}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>{score} / {questions.length}</p>
        <button onClick={restart} className="btn-primary text-sm"><RotateCcw size={14} /> {t('listening.again')}</button>
      </div>
    );
  }

  return (
    <div key={round} className="max-w-xl mx-auto">
      <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>{index + 1} / {questions.length}</span>
        <span>{t('listening.score')}: {score}</span>
      </div>

      <div className="liquid-glass p-8 text-center mb-5">
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{t('listening.prompt')}</p>
        <button
          onClick={() => play(q.chinese)}
          className="w-20 h-20 rounded-full bg-[#FF3333] hover:bg-[#ff5555] transition-colors flex items-center justify-center mx-auto"
          aria-label={t('listening.play')}
        >
          <Volume2 size={32} className="text-white" />
        </button>
        {selected !== null && (
          <p className="font-chinese text-2xl text-white mt-4">{q.chinese}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map(opt => {
          let cls = 'p-4 rounded-xl border text-sm transition-all text-left ';
          if (selected !== null) {
            if (opt.en === q.correct) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
            else if (opt.en === selected) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
            else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
          } else {
            cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-[#FF3333]/30';
          }
          return (
            <button key={opt.en} onClick={() => choose(opt.en)} disabled={selected !== null} className={cls}>
              <span className="block">{lang === 'ar' ? opt.ar : opt.en}</span>
              <span className="block text-xs opacity-60 mt-0.5">{lang === 'ar' ? opt.en : opt.ar}</span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2 text-sm">
            {selected === q.correct
              ? <><Check size={18} className="text-[#10b981]" /><span className="text-[#10b981]">{t('listening.correct')}</span></>
              : <><X size={18} className="text-[#FF3333]" /><span className="text-[#FF3333]">{t('listening.incorrect')}: {lang === 'ar' ? q.correctAr : q.correct}</span></>}
          </div>
          <button onClick={next} className="btn-primary text-sm py-2 px-4">
            {index < questions.length - 1 ? t('listening.next') : t('listening.finish')} <ArrowRight size={14} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
