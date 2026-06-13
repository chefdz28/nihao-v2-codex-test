import { useState } from 'react';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle, Eye, RotateCcw, Volume2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import { checkPinyin, type PinyinCheck } from '@/lib/pinyin';

interface TypePinyinExerciseProps {
  /** Chinese text shown (or hidden for listen-and-type) */
  chinese: string;
  /** expected pinyin answer */
  expected: string;
  promptEn: string;
  promptAr: string;
  /** listen mode: hide the Chinese, play TTS instead */
  listenMode?: boolean;
  onResult?: (correct: boolean) => void;
}

/**
 * V2.0.4: type-the-pinyin exercise. Case/space/punctuation tolerant; exact
 * tone marks = correct; right letters with wrong/missing tones = "almost —
 * check your tones". Includes a listen-and-type mode using existing TTS.
 */
export default function TypePinyinExercise({ chinese, expected, promptEn, promptAr, listenMode = false, onResult }: TypePinyinExerciseProps) {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [value, setValue] = useState('');
  const [result, setResult] = useState<PinyinCheck | null>(null);
  const [revealed, setRevealed] = useState(false);

  const submit = () => {
    if (!value.trim()) return;
    const r = checkPinyin(value, expected);
    setResult(r);
    if (r !== 'almost') onResult?.(r === 'correct');
  };

  const reset = () => { setValue(''); setResult(null); setRevealed(false); };

  return (
    <div>
      <p className={`text-sm mb-2 text-white ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
        {isAr ? promptAr : promptEn}
      </p>

      <div className="flex items-center gap-3 mb-3">
        {listenMode ? (
          <button onClick={() => play(chinese)} className="w-12 h-12 rounded-full bg-[#FF3333] hover:bg-[#ff5555] flex items-center justify-center text-white transition-colors" aria-label={t('listening.play')}>
            <Volume2 size={20} />
          </button>
        ) : (
          <span className="font-chinese text-3xl text-white">{chinese}</span>
        )}
        {!listenMode && (
          <button onClick={() => play(chinese)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF3333]/40 flex items-center justify-center text-white transition-colors" aria-label={t('listening.play')}>
            <Volume2 size={15} />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); if (result) setResult(null); }}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder={t('pinyin.typePlaceholder')}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:border-[#FF3333]/50 outline-none"
          dir="ltr"
        />
        <button onClick={submit} disabled={!value.trim()} className="btn-primary text-sm py-2 px-5 disabled:opacity-40">
          <Check size={14} /> {t('grammar.check')}
        </button>
      </div>

      <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('pinyin.toneHint')}</p>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm">
          {result === 'correct' && (
            <p className="flex items-center gap-2 text-[#10b981]"><Check size={15} /> {t('grammar.correct')} <PinyinText inline size="base" className="!text-white">{expected}</PinyinText></p>
          )}
          {result === 'almost' && (
            <p className="flex items-center gap-2 text-[#f59e0b]"><AlertCircle size={15} /> {t('pinyin.almostTones')}</p>
          )}
          {result === 'wrong' && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-2 text-[#FF3333]"><X size={15} /> {t('grammar.incorrect')}</p>
              {!revealed && (
                <button onClick={() => setRevealed(true)} className="btn-secondary text-xs py-1.5 px-3"><Eye size={12} /> {t('grammar.showAnswer')}</button>
              )}
            </div>
          )}
          {(revealed || result === 'almost') && result !== 'correct' && (
            <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{t('grammar.answer')}: <PinyinText inline size="base">{expected}</PinyinText></p>
          )}
          <button onClick={reset} className="btn-secondary text-xs py-1.5 px-3 mt-2"><RotateCcw size={12} /> {t('grammar.tryAgainBtn')}</button>
        </motion.div>
      )}
    </div>
  );
}
