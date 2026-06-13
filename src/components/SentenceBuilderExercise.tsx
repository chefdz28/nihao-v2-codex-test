import { useState, useMemo } from 'react';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { Check, X, RotateCcw, Eye } from 'lucide-react';
import { useI18n } from '@/i18n';
import { shuffle } from '@/lib/learning';
import type { GrammarExercise } from '@/types/grammar';

interface SentenceBuilderExerciseProps {
  exercise: GrammarExercise;
  showPinyin?: boolean;
  onResult?: (correct: boolean) => void;
}

/**
 * V2.0.3 Sentence Builder: tap word chips to build the sentence, check the
 * order, reset, or reveal. Punctuation chips are included so the learner sees
 * full natural sentences. Mobile-first: big tap targets, wraps cleanly.
 */
export default function SentenceBuilderExercise({ exercise, showPinyin = true, onResult }: SentenceBuilderExerciseProps) {
  const { t, lang } = useI18n();
  const words = useMemo(() => exercise.words || [], [exercise.words]);
  const bank = useMemo(() => shuffle(words.map((w, i) => ({ w, key: `${w}-${i}` }))), [words]);

  const [picked, setPicked] = useState<{ w: string; key: string }[]>([]);
  const [status, setStatus] = useState<'building' | 'correct' | 'wrong' | 'revealed'>('building');

  const used = new Set(picked.map(p => p.key));
  const built = picked.map(p => p.w).join('');

  const pick = (chip: { w: string; key: string }) => {
    if (status !== 'building' || used.has(chip.key)) return;
    setPicked(prev => [...prev, chip]);
  };

  const unpick = (key: string) => {
    if (status !== 'building') return;
    setPicked(prev => prev.filter(p => p.key !== key));
  };

  const check = () => {
    if (picked.length === 0) return;
    const ok = built === exercise.correct;
    setStatus(ok ? 'correct' : 'wrong');
    onResult?.(ok);
  };

  const reset = () => {
    setPicked([]);
    setStatus('building');
  };

  const reveal = () => setStatus('revealed');

  return (
    <div>
      <p className={`text-sm mb-1 text-white ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {lang === 'ar' ? exercise.prompt_ar : exercise.prompt_en}
      </p>
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>{t('grammar.builderHint')}</p>

      {/* Answer area */}
      <div className={`min-h-[58px] rounded-xl border p-3 mb-3 flex flex-wrap gap-2 items-center transition-colors ${
        status === 'correct' ? 'border-[#10b981]/50 bg-[#10b981]/10'
        : status === 'wrong' ? 'border-[#FF3333]/50 bg-[#FF3333]/10'
        : 'border-white/10 bg-white/[0.02]'
      }`}>
        {picked.length === 0 && status === 'building' && (
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t('grammar.tapWords')}</span>
        )}
        {picked.map(p => (
          <button key={p.key} onClick={() => unpick(p.key)} className="px-3 py-2 rounded-lg bg-white/10 font-chinese text-lg text-white hover:bg-white/15 transition-colors">
            {p.w}
          </button>
        ))}
      </div>

      {/* Word bank */}
      {status === 'building' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bank.map(chip => (
            <button
              key={chip.key}
              onClick={() => pick(chip)}
              disabled={used.has(chip.key)}
              className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 font-chinese text-lg text-white hover:bg-[#FF3333]/20 hover:border-[#FF3333]/30 disabled:opacity-25 transition-colors"
            >
              {chip.w}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {status === 'correct' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
          <p className="flex items-center gap-2 text-sm text-[#10b981]">
            <Check size={16} /> {t('grammar.correct')} <span className="font-chinese text-white">{exercise.correct}</span>
          </p>
          {showPinyin && exercise.correct_pinyin && <PinyinText size="base" className="mt-1 ml-6">{exercise.correct_pinyin}</PinyinText>}
        </motion.div>
      )}
      {status === 'wrong' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-[#FF3333] mb-3">
          <X size={16} /> {t('grammar.incorrect')} — <span className="font-chinese">{built}</span>
        </motion.p>
      )}
      {status === 'revealed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          <p>{t('grammar.answer')}: <span className="font-chinese text-white text-lg">{exercise.correct}</span></p>
          {showPinyin && exercise.correct_pinyin && <PinyinText size="base" className="mt-1">{exercise.correct_pinyin}</PinyinText>}
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {status === 'building' && (
          <button onClick={check} disabled={picked.length === 0} className="btn-primary text-xs py-2 px-4 disabled:opacity-40">
            <Check size={13} /> {t('grammar.check')}
          </button>
        )}
        {(status === 'wrong' || status === 'building') && picked.length > 0 && (
          <button onClick={reset} className="btn-secondary text-xs py-2 px-4"><RotateCcw size={13} /> {t('grammar.reset')}</button>
        )}
        {status === 'wrong' && (
          <button onClick={reveal} className="btn-secondary text-xs py-2 px-4"><Eye size={13} /> {t('grammar.showAnswer')}</button>
        )}
        {(status === 'correct' || status === 'revealed') && (
          <button onClick={reset} className="btn-secondary text-xs py-2 px-4"><RotateCcw size={13} /> {t('grammar.tryAgainBtn')}</button>
        )}
      </div>
    </div>
  );
}
