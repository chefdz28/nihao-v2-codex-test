import { useState, useMemo } from 'react';
import { trackActivity, bumpStat, awardDailyXP, XP_REWARDS } from '@/lib/gamification';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { Music2, Volume2, Check, X, RotateCcw, Flame } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import { shuffle } from '@/lib/learning';
import { toneWords, type ToneWord } from '@/data/hanziExtra';

const ROUND_SIZE = 10;
const TONE_LABELS = [
  { tone: 1 as const, mark: 'ˉ', sample: 'mā' },
  { tone: 2 as const, mark: 'ˊ', sample: 'má' },
  { tone: 3 as const, mark: 'ˇ', sample: 'mǎ' },
  { tone: 4 as const, mark: 'ˋ', sample: 'mà' },
];

/**
 * V2.0.5 /tones — tone trainer game: TTS speaks a word, the learner picks
 * tone 1–4. Tracks score and in-game streak. The hardest skill for Arabic
 * speakers, trained with zero new content cost (existing TTS).
 */
export default function ToneTrainer() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';

  const [round, setRound] = useState(0);
  const words = useMemo(() => shuffle(toneWords).slice(0, ROUND_SIZE), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const word: ToneWord = words[index];

  const pick = (tone: number) => {
    if (picked !== null) return;
    setPicked(tone);
    setRevealed(true);
    if (tone === word.tone) {
      setScore(s => s + 1);
      setStreak(st => {
        const next = st + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (index < words.length - 1) {
      setIndex(i => i + 1);
      setPicked(null);
      setRevealed(false);
    } else {
      // V2.1: XP + mission tracking
      trackActivity('tone_rounds');
      if (score === words.length) bumpStat('tone_perfect');
      awardDailyXP(`tone_round_${round}`, XP_REWARDS.tone_round);
      setDone(true);
    }
  };

  const restart = () => {
    setRound(r => r + 1);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setDone(false);
    setRevealed(false);
  };

  if (done) {
    const pct = Math.round((score / words.length) * 100);
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16">
        <div className="liquid-glass p-10 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 70 ? 'bg-[#10b981]/15' : 'bg-[#FF3333]/15'}`}>
            <span className={`font-display font-black text-2xl ${pct >= 70 ? 'text-[#10b981]' : 'text-[#FF3333]'}`}>{pct}%</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">{t('tones.done')}</h2>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{score} / {words.length}</p>
          <p className="text-sm mb-6 flex items-center justify-center gap-1 text-[#f59e0b]"><Flame size={15} /> {t('tones.bestStreak')}: {bestStreak}</p>
          <button onClick={restart} className="btn-primary text-sm"><RotateCcw size={14} /> {t('tones.again')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Music2 className="text-[#FF3333]" /> {t('tones.title')}
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('tones.subtitle')}
        </p>
      </motion.div>

      <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>{index + 1} / {words.length}</span>
        <span className="flex items-center gap-3">
          <span>{t('listening.score')}: {score}</span>
          <span className="flex items-center gap-1 text-[#f59e0b]"><Flame size={12} /> {streak}</span>
        </span>
      </div>

      <div className="liquid-glass p-8 text-center mb-5">
        <button
          onClick={() => play(word.char)}
          className="w-24 h-24 rounded-full bg-[#FF3333] hover:bg-[#ff5555] transition-colors flex items-center justify-center mx-auto mb-4"
          aria-label={t('listening.play')}
        >
          <Volume2 size={36} className="text-white" />
        </button>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t('tones.listen')}</p>
        {revealed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <span className="font-chinese text-4xl text-white">{word.char}</span>
            <PinyinText size="lg" className="text-center">{word.pinyin}</PinyinText>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? word.meaning_ar : word.meaning_en}</p>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {TONE_LABELS.map(tl => {
          let cls = 'p-4 rounded-xl border text-center transition-all ';
          if (picked !== null) {
            if (tl.tone === word.tone) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
            else if (tl.tone === picked) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
            else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
          } else {
            cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-[#FF3333]/30';
          }
          return (
            <button key={tl.tone} onClick={() => pick(tl.tone)} disabled={picked !== null} className={cls}>
              <div className="text-2xl font-bold mb-1">{tl.tone}</div>
              <div className="text-xl">{tl.mark}</div>
              <div className="text-[11px] opacity-70">{tl.sample}</div>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mt-5">
          <span className="flex items-center gap-2 text-sm">
            {picked === word.tone
              ? <><Check size={16} className="text-[#10b981]" /><span className="text-[#10b981]">{t('grammar.correct')}</span></>
              : <><X size={16} className="text-[#FF3333]" /><span className="text-[#FF3333]">{t('tones.itWas')} {word.tone}</span></>}
          </span>
          <button onClick={next} className="btn-primary text-sm py-2 px-4">
            {index < words.length - 1 ? t('listening.next') : t('listening.finish')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
