import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, RotateCcw, Volume2, ArrowRight, Check } from 'lucide-react';
import PinyinText from '@/components/PinyinText';
import { useAudio } from '@/hooks/useAudio';
import { hsk3Batch } from '@/data/dictionaryHsk3';
import { wordSlug } from '@/data/dictionaryCore';
import { due4, rate4, deckSummary, type SrsRating } from '@/lib/srs4';
import { awardXP } from '@/lib/gamification';
import { trackEvent } from '@/lib/analytics';
import { useTestGate } from '@/hooks/useTestGate';
import { usePinyinMode } from '@/hooks/usePinyinMode';
import PinyinToggle from '@/components/PinyinToggle';
import AuthGate from '@/components/AuthGate';
import Seo from '@/components/Seo';
import HskToolsNav from '@/components/HskToolsNav';

const DECK = 'hsk3';
const PREVIEW_LIMIT = 5; // guests can review this many cards before sign-in

// Build a stable card list from the HSK3 dictionary batch.
const CARDS = hsk3Batch.map(w => ({
  id: wordSlug(w.chinese, w.pinyin),
  chinese: w.chinese,
  pinyin: w.pinyin,
  arabic: w.arabic,
  english: w.english,
  example: w.examples && w.examples[0] ? w.examples[0] : null,
}));
const CARD_BY_ID = new Map(CARDS.map(c => [c.id, c]));

const RATINGS: { key: SrsRating; label: string; cls: string }[] = [
  { key: 'again', label: 'أعِد', cls: 'bg-[#FF3333]/15 text-[#FF3333] hover:bg-[#FF3333]/25' },
  { key: 'hard', label: 'صعبة', cls: 'bg-[#f59e0b]/15 text-[#f59e0b] hover:bg-[#f59e0b]/25' },
  { key: 'good', label: 'جيدة', cls: 'bg-[#3b82f6]/15 text-[#3b82f6] hover:bg-[#3b82f6]/25' },
  { key: 'easy', label: 'سهلة', cls: 'bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981]/25' },
];

/** V3.3 /flashcards/hsk3 — HSK3 flashcards with a 4-button SRS (localStorage). */
export default function Hsk3Flashcards() {
  const { play } = useAudio();
  const allIds = useMemo(() => CARDS.map(c => c.id), []);
  const { isAuthenticated, gateOpen, closeGate, setGateOpen } = useTestGate();
  const { mode: pinyinModeVal, setMode: setPinyinMode, isVisible: pinyinIsVisible } = usePinyinMode();
  const [queue, setQueue] = useState<string[]>(() => {
    const { due } = due4(DECK, CARDS.map(c => c.id));
    return due.length > 0 ? due : CARDS.map(c => c.id);
  });
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [summary, setSummary] = useState(() => deckSummary(DECK, CARDS.map(c => c.id)));

  const currentId = queue[pos];
  const card = currentId ? CARD_BY_ID.get(currentId) : undefined;
  const done = pos >= queue.length;

  const handleRate = (rating: SrsRating) => {
    if (!currentId) return;
    // V3.4: guests get a free preview of PREVIEW_LIMIT cards, then sign-in gate
    if (!isAuthenticated && reviewed >= PREVIEW_LIMIT) {
      setGateOpen(true);
      return;
    }
    rate4(DECK, currentId, rating);
    trackEvent('hsk3_flashcard_review', { rating, hsk_level: 3 });
    setReviewed(r => {
      const n = r + 1;
      if (n % 10 === 0) awardXP(`hsk3_flash:${new Date().toISOString().slice(0, 10)}:${n}`, 5);
      return n;
    });
    // "again" → requeue near the end; otherwise advance
    if (rating === 'again') {
      setQueue(q => [...q, currentId]);
    }
    setRevealed(false);
    setPos(p => p + 1);
  };

  const restart = () => {
    const { due } = due4(DECK, allIds);
    setQueue(due.length > 0 ? due : allIds);
    setSummary(deckSummary(DECK, allIds));
    setPos(0);
    setRevealed(false);
    setReviewed(0);
  };

  return (
    <div className="max-w-[560px] mx-auto px-6 py-8">
      <Seo />
      {gateOpen && <AuthGate context="hsk3_flashcards" onClose={closeGate} guestLabel="تابع لاحقاً" />}
      <div className="flex items-center justify-between mb-4" dir="rtl">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <Layers size={22} className="text-[#FF3333]" /> بطاقات HSK3
        </h1>
        <Link to="/dictionary" className="text-xs font-arabic text-[#a0a0a0] hover:text-white">القاموس ←</Link>
      </div>
      <p className="text-xs font-arabic mb-5" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>
        راجع كلمات HSK3 بنظام التكرار المتباعد. قيّم كل بطاقة (أعِد / صعبة / جيدة / سهلة) ليختار النظام موعد المراجعة القادم. تقدّمك محفوظ على جهازك.
      </p>

      {/* V3.4: smart pinyin toggle */}
      <div className="flex justify-end mb-3">
        <PinyinToggle mode={pinyinModeVal} onChange={setPinyinMode} hskLevel={3} compact />
      </div>

      {/* progress bar */}
      <div className="flex items-center justify-between text-[11px] font-arabic mb-2" dir="rtl" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>متعلّمة: {summary.learned}/{summary.total}</span>
        <span>راجعت اليوم: {reviewed}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6">
        <div className="h-full bg-[#FF3333] rounded-full transition-all" style={{ width: `${queue.length ? Math.min(100, (pos / queue.length) * 100) : 0}%` }} />
      </div>

      {done ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass p-8 text-center">
          <Check size={40} className="text-[#10b981] mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-white mb-1">أنهيت جلسة اليوم!</h2>
          <p className="text-sm font-arabic mb-5" style={{ color: 'var(--color-text-secondary)' }}>راجعت {reviewed} بطاقة. عُد غداً لمراجعة المستحقّ.</p>
          <div className="flex justify-center gap-3">
            <button onClick={restart} className="btn-secondary text-sm"><RotateCcw size={14} /> جلسة جديدة</button>
            <Link to="/hsk3-simulation" className="btn-primary text-sm font-arabic">اختبر نفسك <ArrowRight size={14} /></Link>
          </div>
        </motion.div>
      ) : card ? (
        <AnimatePresence mode="wait">
          <motion.div key={currentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="liquid-glass p-8 text-center min-h-[240px] flex flex-col justify-center">
              <p className="font-chinese text-5xl text-white mb-3">{card.chinese}</p>
              <button onClick={() => play(card.chinese)} className="mx-auto mb-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center" aria-label="استمع">
                <Volume2 size={16} className="text-[#FF3333]" />
              </button>

              {!revealed ? (
                <button onClick={() => setRevealed(true)} className="btn-secondary text-sm mx-auto font-arabic">إظهار المعنى</button>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {pinyinIsVisible(3) && <PinyinText className="text-lg block mb-1">{card.pinyin}</PinyinText>}
                  <p className="font-arabic text-white text-lg mb-2" dir="rtl">{card.arabic}</p>
                  {card.example && (
                    <p className="text-sm mt-2" dir="rtl">
                      <span className="font-chinese text-white">{card.example.zh}</span>
                      <span className="font-arabic block text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{card.example.ar}</span>
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {revealed && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {RATINGS.map(r => (
                  <button key={r.key} onClick={() => handleRate(r.key)} className={`py-2.5 rounded-xl text-xs font-display font-bold font-arabic transition-colors ${r.cls}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="liquid-glass p-8 text-center font-arabic text-sm" style={{ color: 'var(--color-text-secondary)' }}>جارٍ التحميل…</div>
      )}
      <HskToolsNav />
    </div>
  );
}
