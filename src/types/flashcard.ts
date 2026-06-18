export interface Flashcard {
  id: number;
  chinese: string;
  pinyin: string;
  arabic: string;
  category: string;
  hsk_level: number;
  difficulty: number;
}

export interface UserCardProgress {
  id: string;
  user_id: string;
  card_id: number;
  familiarity: number;
  correct_count: number;
  wrong_count: number;
  next_review: string | null;
  last_seen: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  cards_played: number;
  correct_answers: number;
  wrong_answers: number;
  xp_earned: number;
  coins_earned: number;
  max_combo: number;
}

export interface DailyMission {
  id: string;
  user_id: string;
  mission_date: string;
  mission_type: string;
  target: number;
  progress: number;
  is_completed: boolean;
  xp_reward: number;
}

export interface GameState {
  currentCard: Flashcard | null;
  isFlipped: boolean;
  cardsPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
  combo: number;
  maxCombo: number;
  xpEarned: number;
  coinsEarned: number;
  lives: number;
  isComplete: boolean;
  isLoading: boolean;
  queue: Flashcard[];
  currentIndex: number;
}

export type GameAction = 
  | { type: 'START_GAME'; payload: Flashcard[] }
  | { type: 'FLIP_CARD' }
  | { type: 'ANSWER_CORRECT' }
  | { type: 'ANSWER_WRONG' }
  | { type: 'DONT_KNOW' }
  | { type: 'NEXT_CARD' }
  | { type: 'COMPLETE_GAME' }
  | { type: 'SET_LOADING'; payload: boolean };
