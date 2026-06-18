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
