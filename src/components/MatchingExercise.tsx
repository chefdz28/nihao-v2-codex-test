import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n';
import { shuffle } from '@/lib/learning';

interface MatchingExerciseProps {
  pairs: { left: string; right: string }[];
  promptEn: string;
  promptAr: string;
  /** style hint: left column font (chinese for hanzi, default for pinyin) */
  leftIsChinese?: boolean;
  onResult?: (correct: boolean) => void;
}

/**
 * V2.0.4: tap-to-match exercise (Chinese ↔ pinyin, pinyin ↔ meaning).
 * Tap one item on each side; correct pairs lock green, wrong picks flash red.
 * Completing all pairs with no mistakes counts as correct.
 */
export default function MatchingExercise({ pairs, promptEn, promptAr, leftIsChinese = true, onResult }: MatchingExerciseProps) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [round, setRound] = useState(0);
  const left = useMemo(() => shuffle(pairs.map(p => p.left)), [pairs, round]);   // eslint-disable-line react-hooks/exhaustive-deps
  const right = useMemo(() => shuffle(pairs.map(p => p.right)), [pairs, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const answerOf = (l: string) => pairs.find(p => p.left === l)?.right;
  const done = matched.size === pairs.length;

  const tryMatch = (l: string | null, r: string | null) => {
    if (!l || !r) return;
    if (answerOf(l) === r) {
      const next = new Set(matched).add(l);
      setMatched(next);
      if (next.size === pairs.length) onResult?.(mistakes === 0);
    } else {
      setMistakes(m => m + 1);
      setFlash(l + '|' + r);
      setTimeout(() => setFlash(null), 450);
    }
    setSelLeft(null);
    setSelRight(null);
  };

  const pickLeft = (l: string) => {
    if (matched.has(l)) return;
    setSelLeft(l);
    tryMatch(l, selRight);
    if (!selRight) setSelLeft(l);
  };

  const pickRight = (r: string) => {
    if ([...matched].some(l => answerOf(l) === r)) return;
    setSelRight(r);
    tryMatch(selLeft, r);
    if (!selLeft) setSelRight(r);
  };

  const reset = () => {
    setMatched(new Set());
    setSelLeft(null);
    setSelRight(null);
    setMistakes(0);
    setRound(x => x + 1);
  };

  const btnCls = (active: boolean, ok: boolean, bad: boolean) =>
    `w-full p-3 rounded-xl border text-base transition-all ${
      ok ? 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]'
      : bad ? 'border-[#FF3333]/60 bg-[#FF3333]/20 text-[#FF3333]'
      : active ? 'border-[#FF3333]/60 bg-[#FF3333]/10 text-white'
      : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]'
    }`;

  return (
    <div>
      <p className={`text-sm mb-3 text-white ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
        {isAr ? promptAr : promptEn}
      </p>

      <div className="grid grid-cols-2 gap-3" dir="ltr">
        <div className="space-y-2">
          {left.map(l => (
            <button key={l} onClick={() => pickLeft(l)} disabled={matched.has(l)}
              className={btnCls(selLeft === l, matched.has(l), flash?.startsWith(l + '|') || false) + (leftIsChinese ? ' font-chinese text-xl' : '')}>
              {l}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map(r => {
            const isMatched = [...matched].some(l => answerOf(l) === r);
            return (
              <button key={r} onClick={() => pickRight(r)} disabled={isMatched}
                className={btnCls(selRight === r, isMatched, flash?.endsWith('|' + r) || false)}>
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {matched.size} / {pairs.length} · {t('pinyin.mistakes')}: {mistakes}
        </span>
        {done && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-[#10b981]">
            <Check size={15} /> {mistakes === 0 ? t('grammar.correct') : t('pinyin.completedWithMistakes')}
          </motion.span>
        )}
        <button onClick={reset} className="btn-secondary text-xs py-1.5 px-3"><RotateCcw size={12} /> {t('grammar.reset')}</button>
      </div>
    </div>
  );
}
