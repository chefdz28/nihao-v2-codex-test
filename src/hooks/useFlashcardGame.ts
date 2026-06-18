import { useReducer, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSRS } from './useSRS';
import type { GameState, GameAction, UserCardProgress } from '@/types/flashcard';

const MAX_LIVES = 5;
const SESSION_SIZE = 10;
const XP_PER_CORRECT = 10;
const COINS_PER_CORRECT = 1;
const COMBO_BONUS_EVERY = 5;
const COMBO_BONUS_XP = 5;

const initialState: GameState = {
  currentCard: null,
  isFlipped: false,
  cardsPlayed: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  combo: 0,
  maxCombo: 0,
  xpEarned: 0,
  coinsEarned: 0,
  lives: MAX_LIVES,
  isComplete: false,
  isLoading: true,
  queue: [],
  currentIndex: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        queue: action.payload,
        currentCard: action.payload[0] || null,
        isLoading: false,
      };
    case 'FLIP_CARD':
      return { ...state, isFlipped: true };
    case 'ANSWER_CORRECT': {
      const newCombo = state.combo + 1;
      const comboBonus = newCombo % COMBO_BONUS_EVERY === 0 ? COMBO_BONUS_XP : 0;
      return {
        ...state,
        correctAnswers: state.correctAnswers + 1,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        xpEarned: state.xpEarned + XP_PER_CORRECT + comboBonus,
        coinsEarned: state.coinsEarned + COINS_PER_CORRECT,
        isFlipped: false,
      };
    }
    case 'ANSWER_WRONG':
      return {
        ...state,
        wrongAnswers: state.wrongAnswers + 1,
        combo: 0,
        lives: Math.max(0, state.lives - 1),
        isFlipped: false,
      };
    case 'DONT_KNOW':
      return {
        ...state,
        wrongAnswers: state.wrongAnswers + 1,
        combo: 0,
        lives: Math.max(0, state.lives - 1),
        isFlipped: false,
      };
    case 'NEXT_CARD': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        return { ...state, isComplete: true, cardsPlayed: state.cardsPlayed + 1 };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        currentCard: state.queue[nextIndex],
        cardsPlayed: state.cardsPlayed + 1,
        isFlipped: false,
      };
    }
    case 'COMPLETE_GAME':
      return { ...state, isComplete: true };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function useFlashcardGame(userId: string | null) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [progressMap, setProgressMap] = useState<Map<number, UserCardProgress>>(new Map());
  const { buildQueue, updateProgress } = useSRS();

  const loadGame = useCallback(async () => {
    if (!userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    const { data: cards, error: cardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('hsk_level', 1)
      .order('id');

    if (cardsError || !cards) {
      console.error('Error loading flashcards:', cardsError);
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const { data: progress } = await supabase
      .from('user_card_progress')
      .select('*')
      .eq('user_id', userId);

    const map = new Map<number, UserCardProgress>();
    progress?.forEach(p => map.set(p.card_id, p));
    setProgressMap(map);

    const queue = buildQueue(cards, map, SESSION_SIZE);
    dispatch({ type: 'START_GAME', payload: queue });
  }, [userId, buildQueue]);

  const handleKnow = useCallback(() => {
    dispatch({ type: 'FLIP_CARD' });
  }, []);

  const handleDontKnow = useCallback(async () => {
    if (!userId || !state.currentCard) return;
    await updateProgress(userId, state.currentCard.id, false);
    dispatch({ type: 'DONT_KNOW' });
    dispatch({ type: 'NEXT_CARD' });
  }, [userId, state.currentCard, updateProgress]);

  const handleCorrect = useCallback(async () => {
    if (!userId || !state.currentCard) return;
    await updateProgress(userId, state.currentCard.id, true);
    dispatch({ type: 'ANSWER_CORRECT' });
    dispatch({ type: 'NEXT_CARD' });
  }, [userId, state.currentCard, updateProgress]);

  const handleWrong = useCallback(async () => {
    if (!userId || !state.currentCard) return;
    await updateProgress(userId, state.currentCard.id, false);
    dispatch({ type: 'ANSWER_WRONG' });
    dispatch({ type: 'NEXT_CARD' });
  }, [userId, state.currentCard, updateProgress]);

  const saveSession = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        ended_at: new Date().toISOString(),
        cards_played: state.cardsPlayed,
        correct_answers: state.correctAnswers,
        wrong_answers: state.wrongAnswers,
        xp_earned: state.xpEarned,
        coins_earned: state.coinsEarned,
        max_combo: state.maxCombo,
      });

    if (error) console.error('Error saving session:', error);

    // NiHao: there's no auto-created profile row, so read-or-create then add.
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_xp, coins, lives')
      .eq('id', userId)
      .maybeSingle();

    await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        total_xp: (profile?.total_xp || 0) + state.xpEarned,
        coins: (profile?.coins || 0) + state.coinsEarned,
        lives: state.lives,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  }, [userId, state]);

  useEffect(() => {
    if (state.isComplete && userId) {
      saveSession();
    }
  }, [state.isComplete, userId, saveSession]);

  const accuracy = state.cardsPlayed > 0 
    ? Math.round((state.correctAnswers / state.cardsPlayed) * 100) 
    : 0;

  return {
    ...state,
    accuracy,
    loadGame,
    handleKnow,
    handleDontKnow,
    handleCorrect,
    handleWrong,
    progressMap,
  };
}
