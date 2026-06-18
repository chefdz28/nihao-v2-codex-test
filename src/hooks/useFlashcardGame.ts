import { useReducer, useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSRS } from './useSRS';
import type { Flashcard, UserCardProgress } from '@/types/flashcard';

const SESSION_SIZE = 10;
const XP_PER_CORRECT = 10;
const COINS_PER_CORRECT = 1;
const COMBO_BONUS_EVERY = 3;
const COMBO_BONUS_XP = 5;
const OPTIONS_COUNT = 4;

export interface QuizQuestion {
  card: Flashcard;
  options: string[];        // 4 Arabic options (shuffled)
  correctIndex: number;     // index of the right answer in options
}

interface QuizState {
  questions: QuizQuestion[];
  index: number;
  selected: number | null;   // which option the user tapped (null = not answered)
  isCorrect: boolean | null;
  correctAnswers: number;
  wrongAnswers: number;
  combo: number;
  maxCombo: number;
  xpEarned: number;
  coinsEarned: number;
  isComplete: boolean;
  isLoading: boolean;
}

type QuizAction =
  | { type: 'START'; payload: QuizQuestion[] }
  | { type: 'ANSWER'; payload: number }
  | { type: 'NEXT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: QuizState = {
  questions: [],
  index: 0,
  selected: null,
  isCorrect: null,
  correctAnswers: 0,
  wrongAnswers: 0,
  combo: 0,
  maxCombo: 0,
  xpEarned: 0,
  coinsEarned: 0,
  isComplete: false,
  isLoading: true,
};

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return { ...initialState, questions: action.payload, isLoading: false };
    case 'ANSWER': {
      if (state.selected !== null) return state; // already answered
      const q = state.questions[state.index];
      const correct = action.payload === q.correctIndex;
      if (correct) {
        const newCombo = state.combo + 1;
        const bonus = newCombo % COMBO_BONUS_EVERY === 0 ? COMBO_BONUS_XP : 0;
        return {
          ...state,
          selected: action.payload,
          isCorrect: true,
          correctAnswers: state.correctAnswers + 1,
          combo: newCombo,
          maxCombo: Math.max(state.maxCombo, newCombo),
          xpEarned: state.xpEarned + XP_PER_CORRECT + bonus,
          coinsEarned: state.coinsEarned + COINS_PER_CORRECT,
        };
      }
      return {
        ...state,
        selected: action.payload,
        isCorrect: false,
        wrongAnswers: state.wrongAnswers + 1,
        combo: 0,
      };
    }
    case 'NEXT': {
      const next = state.index + 1;
      if (next >= state.questions.length) return { ...state, isComplete: true };
      return { ...state, index: next, selected: null, isCorrect: null };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// Fisher-Yates shuffle (returns a new array)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a multiple-choice question: the card's Arabic is correct; 3 distractors
// come from other cards (prefer same category for believable wrong answers).
function buildQuestion(card: Flashcard, pool: Flashcard[]): QuizQuestion {
  const sameCat = pool.filter(c => c.id !== card.id && c.category === card.category);
  const others = pool.filter(c => c.id !== card.id && c.category !== card.category);
  const distractPool = shuffle(sameCat).concat(shuffle(others));
  const seen = new Set<string>([card.arabic]);
  const distractors: string[] = [];
  for (const c of distractPool) {
    if (distractors.length >= OPTIONS_COUNT - 1) break;
    if (!seen.has(c.arabic)) { seen.add(c.arabic); distractors.push(c.arabic); }
  }
  const options = shuffle([card.arabic, ...distractors]);
  return { card, options, correctIndex: options.indexOf(card.arabic) };
}

export function useFlashcardGame(userId: string | null) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [progressMap, setProgressMap] = useState<Map<number, UserCardProgress>>(new Map());
  const { buildQueue, updateProgress } = useSRS();

  const loadGame = useCallback(async () => {
    if (!userId) return;
    dispatch({ type: 'SET_LOADING', payload: true });

    const { data: cards, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('hsk_level', 1)
      .order('id');

    if (error || !cards || cards.length < OPTIONS_COUNT) {
      console.error('Error loading flashcards:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const { data: progress } = await supabase
      .from('user_card_progress')
      .select('*')
      .eq('user_id', userId);

    const map = new Map<number, UserCardProgress>();
    progress?.forEach((p: UserCardProgress) => map.set(p.card_id, p));
    setProgressMap(map);

    // SRS picks which cards to study; pool (all cards) feeds the distractors.
    const queue = buildQueue(cards as Flashcard[], map, SESSION_SIZE);
    const questions = queue.map((card: Flashcard) => buildQuestion(card, cards as Flashcard[]));
    dispatch({ type: 'START', payload: questions });
  }, [userId, buildQueue]);

  const answer = useCallback((optionIndex: number) => {
    if (state.selected !== null) return;
    const q = state.questions[state.index];
    const isCorrect = optionIndex === q.correctIndex;
    dispatch({ type: 'ANSWER', payload: optionIndex });
    if (userId) void updateProgress(userId, q.card.id, isCorrect);
  }, [state.selected, state.questions, state.index, userId, updateProgress]);

  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);

  const saveSession = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase.from('game_sessions').insert({
      user_id: userId,
      ended_at: new Date().toISOString(),
      cards_played: state.questions.length,
      correct_answers: state.correctAnswers,
      wrong_answers: state.wrongAnswers,
      xp_earned: state.xpEarned,
      coins_earned: state.coinsEarned,
      max_combo: state.maxCombo,
    });
    if (error) console.error('Error saving session:', error);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_xp, coins')
      .eq('id', userId)
      .maybeSingle();

    await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        total_xp: (profile?.total_xp || 0) + state.xpEarned,
        coins: (profile?.coins || 0) + state.coinsEarned,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  }, [userId, state]);

  useEffect(() => {
    if (state.isComplete && userId) void saveSession();
  }, [state.isComplete, userId, saveSession]);

  const current = state.questions[state.index] || null;
  const answered = state.correctAnswers + state.wrongAnswers;
  const accuracy = answered > 0 ? Math.round((state.correctAnswers / answered) * 100) : 0;

  return {
    current,
    questionNumber: state.index + 1,
    totalQuestions: state.questions.length,
    selected: state.selected,
    isCorrect: state.isCorrect,
    correctAnswers: state.correctAnswers,
    wrongAnswers: state.wrongAnswers,
    combo: state.combo,
    maxCombo: state.maxCombo,
    xpEarned: state.xpEarned,
    coinsEarned: state.coinsEarned,
    isComplete: state.isComplete,
    isLoading: state.isLoading,
    accuracy,
    progressMap,
    loadGame,
    answer,
    next,
  };
}
