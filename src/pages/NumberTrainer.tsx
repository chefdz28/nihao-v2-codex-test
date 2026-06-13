import { useState, useCallback, useMemo } from 'react';
import { trackActivity, bumpStat, awardDailyXP, XP_REWARDS } from '@/lib/gamification';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { Hash, Check, X, Volume2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import { numberToChinese, numberToPinyin, numberOptions, randInt } from '@/lib/numbers';
import TypePinyinExercise from '@/components/TypePinyinExercise';

type Mode = 'pick' | 'type' | 'listen';

/**
 * V2.0.5 /numbers — endless number trainer (0–100), generated on the fly:
 * - Pick: see the numeral, choose the Chinese
 * - Type: see the numeral, type the pinyin
 * - Listen: hear the Chinese, choose the numeral
 */
export default function NumberTrainer() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';

  const [mode, setMode] = useState<Mode>('pick');
  const [n, setN] = useState(() => randInt(0, 100));
  const [opts, setOpts] = useState(() => numberOptions(n));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [typeKey, setTypeKey] = useState(0);

  const newQuestion = useCallback(() => {
    const next = randInt(0, 100);
    setN(next);
    setOpts(numberOptions(next));
    setPicked(null);
    setTypeKey(k => k + 1);
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setScore({ right: 0, total: 0 });
    newQuestion();
  };

  const pick = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === opts.correct) bumpStat('number_correct');
    setScore(s => {
      const next = { right: s.right + (opt === opts.correct ? 1 : 0), total: s.total + 1 };
      if (next.total % 10 === 0) { trackActivity('number_rounds'); awardDailyXP(`number_round_${Date.now()}`, XP_REWARDS.number_round); }
      return next;
    });
  };

  // listen mode: numeral options computed once per question (memoized — pure render)
  const listenOptions = useMemo(() => {
    const set = new Set<number>([n]);
    while (set.size < 4) set.add(randInt(0, 100));
    return [...set].sort((a, b) => ((a * 7919 + n) % 13) - ((b * 7919 + n) % 13));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, typeKey]);
  const [listenPick, setListenPick] = useState<number | null>(null);

  const pickListen = (val: number) => {
    if (listenPick !== null) return;
    setListenPick(val);
    setScore(s => ({ right: s.right + (val === n ? 1 : 0), total: s.total + 1 }));
  };

  const nextListen = () => {
    setListenPick(null);
    newQuestion();
  };

  return (
    <div className="max-w-[600px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Hash className="text-[#FF3333]" /> {t('numbers.title')}
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('numbers.subtitle')}
        </p>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {([['pick', t('numbers.modePick')], ['type', t('numbers.modeType')], ['listen', t('numbers.modeListen')]] as const).map(([m, label]) => (
          <button key={m} onClick={() => switchMode(m)}
            className={`px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${mode === m ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
        {t('listening.score')}: {score.right} / {score.total}
      </p>

      {/* PICK: numeral -> chinese */}
      {mode === 'pick' && (
        <div className="liquid-glass p-8">
          <p className="text-center font-display font-black text-6xl text-white mb-6">{n}</p>
          <div className="grid grid-cols-2 gap-3">
            {opts.options.map(o => {
              let cls = 'p-4 rounded-xl border font-chinese text-2xl transition-all ';
              if (picked !== null) {
                if (o === opts.correct) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
                else if (o === picked) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
                else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
              } else {
                cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]';
              }
              return <button key={o} onClick={() => pick(o)} disabled={picked !== null} className={cls}>{o}</button>;
            })}
          </div>
          {picked !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mt-5">
              <span className="flex items-center gap-2 text-sm">
                {picked === opts.correct
                  ? <><Check size={16} className="text-[#10b981]" /><PinyinText inline size="base" className="!text-[#10b981]">{numberToPinyin(n)}</PinyinText></>
                  : <><X size={16} className="text-[#FF3333]" /><span className="text-white font-chinese">{opts.correct}</span><PinyinText inline size="base">{numberToPinyin(n)}</PinyinText></>}
              </span>
              <button onClick={newQuestion} className="btn-primary text-sm py-2 px-4">{t('listening.next')} <ArrowRight size={14} /></button>
            </motion.div>
          )}
        </div>
      )}

      {/* TYPE: numeral -> pinyin */}
      {mode === 'type' && (
        <div className="liquid-glass p-8">
          <p className="text-center font-display font-black text-6xl text-white mb-2">{n}</p>
          <p className="text-center font-chinese text-2xl text-white mb-6">{numberToChinese(n)}</p>
          <TypePinyinExercise
            key={typeKey}
            chinese={numberToChinese(n)}
            expected={numberToPinyin(n)}
            promptEn="Type the Pinyin for this number:"
            promptAr="اكتب البينين لهذا الرقم:"
            onResult={ok => setScore(s => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))}
          />
          <div className="text-center mt-4">
            <button onClick={newQuestion} className="btn-secondary text-sm py-2 px-4">{t('numbers.newNumber')} <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {/* LISTEN: audio -> numeral */}
      {mode === 'listen' && (
        <div className="liquid-glass p-8">
          <button onClick={() => play(numberToChinese(n))}
            className="w-24 h-24 rounded-full bg-[#FF3333] hover:bg-[#ff5555] transition-colors flex items-center justify-center mx-auto mb-6"
            aria-label={t('listening.play')}>
            <Volume2 size={36} className="text-white" />
          </button>
          <div className="grid grid-cols-2 gap-3">
            {listenOptions.map(o => {
              let cls = 'p-4 rounded-xl border font-display font-black text-3xl transition-all ';
              if (listenPick !== null) {
                if (o === n) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
                else if (o === listenPick) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
                else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
              } else {
                cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]';
              }
              return <button key={o} onClick={() => pickListen(o)} disabled={listenPick !== null} className={cls}>{o}</button>;
            })}
          </div>
          {listenPick !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mt-5">
              <span className="text-sm">
                <span className="font-chinese text-white text-lg">{numberToChinese(n)}</span>
                <PinyinText inline size="base" className="ml-2">{numberToPinyin(n)}</PinyinText>
              </span>
              <button onClick={nextListen} className="btn-primary text-sm py-2 px-4">{t('listening.next')} <ArrowRight size={14} /></button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
