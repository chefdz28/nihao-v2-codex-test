import { useState, useMemo } from 'react';
import { recordMistake } from '@/lib/mistakes';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { shuffle } from '@/lib/learning';
import type { GrammarExercise } from '@/types/grammar';

interface GrammarExerciseCardProps {
  exercise: GrammarExercise;
  showPinyin?: boolean;
  onResult?: (correct: boolean) => void;
}

/**
 * V2.0.3: multiple-choice grammar exercise card. Handles fill_blank,
 * formal_casual, transform_question, transform_negative, dialogue and
 * context_choice — anything with options. (word_order uses SentenceBuilder.)
 */
export default function GrammarExerciseCard({ exercise, showPinyin = true, onResult }: GrammarExerciseCardProps) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => shuffle(exercise.options || []), [exercise.options]);

  const typeLabel = t(`grammar.type.${exercise.type}`);

  const choose = (opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt !== exercise.correct) {
      recordMistake({
        source: 'grammar',
        question: exercise.prompt_en || exercise.prompt_ar || exercise.chinese || 'Grammar exercise',
        chinese: exercise.chinese || exercise.correct,
        pinyin: exercise.correct_pinyin || undefined,
        yourAnswer: opt,
        correctAnswer: exercise.correct,
        link: '/courses',
      });
    }
    onResult?.(opt === exercise.correct);
  };

  return (
    <div>
      <span className="inline-block text-[10px] uppercase font-display font-semibold px-2 py-1 rounded-md bg-white/[0.06] mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
        {typeLabel}
      </span>
      <p className={`text-sm mb-1 text-white ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
        {isAr ? exercise.prompt_ar : exercise.prompt_en}
      </p>
      {exercise.chinese && (
        <p className="font-chinese text-xl text-white mb-3 mt-2">{exercise.chinese}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        {options.map(opt => {
          let cls = 'p-3 rounded-xl border text-left transition-all font-chinese text-base ';
          if (selected !== null) {
            if (opt === exercise.correct) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
            else if (opt === selected) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
            else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
          } else {
            cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-[#FF3333]/30';
          }
          return (
            <button key={opt} onClick={() => choose(opt)} disabled={selected !== null} className={cls}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm">
          {selected === exercise.correct ? (
            <p className="flex items-center gap-2 text-[#10b981]"><Check size={15} /> {t('grammar.correct')}</p>
          ) : (
            <p className="flex items-center gap-2 text-[#FF3333]"><X size={15} /> {t('grammar.incorrect')} — {t('grammar.answer')}: <span className="font-chinese text-white">{exercise.correct}</span></p>
          )}
          {showPinyin && exercise.correct_pinyin && (
            <PinyinText size="base" className="mt-1">{exercise.correct_pinyin}</PinyinText>
          )}
          {(exercise.explanation_en || exercise.explanation_ar) && (
            <p className={`mt-1 text-xs ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
              {isAr ? (exercise.explanation_ar || exercise.explanation_en) : (exercise.explanation_en || exercise.explanation_ar)}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
