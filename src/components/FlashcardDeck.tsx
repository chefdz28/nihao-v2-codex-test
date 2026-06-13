import { useState, useMemo } from 'react';
import { trackActivity, awardDailyXP, XP_REWARDS } from '@/lib/gamification';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import AudioButton from '@/components/AudioButton';
import type { VocabRow } from '@/types/supabase';
import { dueCards, recordAnswer } from '@/lib/srs';

interface FlashcardDeckProps {
  vocabulary: VocabRow[];
  /** V2.0.5: enables spaced repetition; pass a stable deck key (e.g. lesson id) */
  srsDeck?: string;
}

/**
 * V2 Flashcards: Chinese on the front; tap to reveal pinyin + Arabic + English.
 * "I know it" removes the card from the round, "Review again" sends it to the back.
 */
export default function FlashcardDeck({ vocabulary, srsDeck }: FlashcardDeckProps) {
  const { t } = useI18n();
  const allIds = useMemo(() => vocabulary.map(v => v.id), [vocabulary]);
  const srsInfo = useMemo(() => (srsDeck ? dueCards(srsDeck, allIds) : null), [srsDeck, allIds]);
  // SRS mode: start with today's due cards (all of them if nothing studied yet)
  const initialIds = useMemo(
    () => (srsInfo && srsInfo.due.length > 0 ? srsInfo.due : allIds),
    [srsInfo, allIds],
  );
  const [queue, setQueue] = useState<string[]>(initialIds);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [flipped, setFlipped] = useState(false);

  const byId = useMemo(() => new Map(vocabulary.map(v => [v.id, v])), [vocabulary]);
  const card = queue.length > 0 ? byId.get(queue[0]) : undefined;

  const restart = () => {
    setQueue(initialIds);
    setKnown(new Set());
    setFlipped(false);
  };

  const markKnown = () => {
    if (!card) return;
    trackActivity('cards_reviewed');
    awardDailyXP(`flash_${card.id}`, XP_REWARDS.flashcard_review);
    if (srsDeck) recordAnswer(srsDeck, card.id, true);
    setKnown(prev => new Set(prev).add(card.id));
    setQueue(q => q.slice(1));
    setFlipped(false);
  };

  const reviewAgain = () => {
    if (!card) return;
    trackActivity('cards_reviewed');
    if (srsDeck) recordAnswer(srsDeck, card.id, false);
    setQueue(q => [...q.slice(1), q[0]]);
    setFlipped(false);
  };

  if (vocabulary.length === 0) {
    return <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('flashcards.empty')}</p>;
  }

  if (!card) {
    return (
      <div className="liquid-glass p-10 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#10b981]/15 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-[#10b981]" />
        </div>
        <h3 className="font-display font-bold text-xl text-white mb-2">{t('flashcards.done.title')}</h3>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          {t('flashcards.done.sub')} ({known.size}/{vocabulary.length})
        </p>
        {srsDeck && <p className="text-xs mb-6 text-[#f59e0b]">{t('flashcards.srsNote')}</p>}
        {!srsDeck && <span className="block mb-4" />}
        <button onClick={restart} className="btn-primary text-sm">
          <RotateCcw size={14} /> {t('flashcards.restart')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
        <span>{t('flashcards.remaining')}: {queue.length}</span>
        {srsDeck && srsInfo && <span className="text-[#f59e0b]">{t('flashcards.dueToday')}: {initialIds.length}</span>}
        <span>{t('flashcards.known')}: {known.size}/{vocabulary.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.button
          key={card.id + (flipped ? '-b' : '-f')}
          initial={{ opacity: 0, rotateY: flipped ? -90 : 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setFlipped(f => !f)}
          className="w-full min-h-[260px] liquid-glass rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer border border-white/10 hover:border-[#FF3333]/30 transition-colors"
        >
          {!flipped ? (
            <>
              <span className="font-chinese text-6xl text-white">{card.chinese}</span>
              <span className="text-xs mt-4" style={{ color: 'var(--color-text-tertiary)' }}>{t('flashcards.tapToReveal')}</span>
            </>
          ) : (
            <>
              <span className="font-chinese text-4xl text-white">{card.chinese}</span>
              <span className="text-xl text-[#FF3333] font-semibold">{card.pinyin}</span>
              <span className="font-arabic text-lg" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{card.arabic}</span>
              <span className="text-base" style={{ color: 'var(--color-text-secondary)' }}>{card.english}</span>
            </>
          )}
        </motion.button>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-3 mt-5">
        <AudioButton text={card.chinese} size="md" />
        <button onClick={reviewAgain} className="btn-secondary text-sm py-2 px-4">
          <RotateCcw size={14} /> {t('flashcards.reviewAgain')}
        </button>
        <button onClick={markKnown} className="btn-primary text-sm py-2 px-4">
          <Check size={14} /> {t('flashcards.knowIt')}
        </button>
        <button onClick={reviewAgain} aria-label={t('flashcards.next')} className="btn-secondary text-sm py-2 px-3">
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
