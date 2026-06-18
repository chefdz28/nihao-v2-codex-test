import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Flashcard, UserCardProgress } from '@/types/flashcard';

interface SRSQueueItem {
  card: Flashcard;
  progress: UserCardProgress | null;
  score: number;
}

export function useSRS() {
  const buildQueue = useCallback((
    cards: Flashcard[],
    progressMap: Map<number, UserCardProgress>,
    sessionSize: number = 10
  ): Flashcard[] => {
    const scored: SRSQueueItem[] = cards.map(card => {
      const prog = progressMap.get(card.id) || null;
      let score = 0;

      if (prog) {
        if (prog.wrong_count > prog.correct_count) score += 100;
        if (prog.familiarity < 2) score += 50;
        if (prog.next_review && new Date(prog.next_review) <= new Date()) score += 30;
        score += prog.wrong_count * 10;
      } else {
        score += 75;
      }

      return { card, progress: prog, score };
    });

    const shuffled = scored.sort(() => Math.random() - 0.5);
    shuffled.sort((a, b) => b.score - a.score);

    return shuffled.slice(0, sessionSize).map(item => item.card);
  }, []);

  const updateProgress = useCallback(async (
    userId: string,
    cardId: number,
    isCorrect: boolean
  ): Promise<void> => {
    const { data: existing } = await supabase
      .from('user_card_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .single();

    if (existing) {
      const correctCount = existing.correct_count + (isCorrect ? 1 : 0);
      const wrongCount = existing.wrong_count + (isCorrect ? 0 : 1);
      const familiarity = Math.min(5, Math.max(0, 
        existing.familiarity + (isCorrect ? 1 : -1)
      ));

      const hours = [1, 4, 24, 72, 168, 336][familiarity] || 1;
      const nextReview = new Date();
      nextReview.setHours(nextReview.getHours() + hours);

      await supabase
        .from('user_card_progress')
        .update({
          correct_count: correctCount,
          wrong_count: wrongCount,
          familiarity,
          next_review: nextReview.toISOString(),
          last_seen: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      const familiarity = isCorrect ? 1 : 0;
      const nextReview = new Date();
      nextReview.setHours(nextReview.getHours() + (isCorrect ? 4 : 1));

      await supabase
        .from('user_card_progress')
        .insert({
          user_id: userId,
          card_id: cardId,
          familiarity,
          correct_count: isCorrect ? 1 : 0,
          wrong_count: isCorrect ? 0 : 1,
          next_review: nextReview.toISOString(),
          last_seen: new Date().toISOString()
        });
    }
  }, []);

  return { buildQueue, updateProgress };
}
