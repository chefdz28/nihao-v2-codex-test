// V2.0.3 Grammar & Sentence Builder types.
// Matches supabase/optional-grammar.sql; also used by the built-in fallback content.

export type GrammarExerciseType =
  | 'fill_blank'          // choose the missing word
  | 'word_order'          // build the sentence from word chips
  | 'formal_casual'       // pick the appropriate register
  | 'transform_question'  // statement -> yes/no question
  | 'transform_negative'  // affirmative -> negative
  | 'dialogue'            // complete the dialogue reply
  | 'context_choice'      // pick what fits the situation
  // V2.0.4 additions:
  | 'choose_pinyin'       // pick the correct pinyin for a Chinese word
  | 'tone_choice'         // pick the correct tone (mā/má/mǎ/mà)
  | 'type_pinyin'         // type the pinyin answer (checked locally)
  | 'match_zh_pinyin'     // match Chinese <-> pinyin pairs
  | 'match_pinyin_meaning'; // match pinyin <-> meaning pairs

export interface GrammarExample {
  chinese: string;
  pinyin: string;
  arabic: string;
  english: string;
}

export interface GrammarMistake {
  wrong: string;
  right: string;
  /** V2.0.4: pinyin readings so beginners can read both versions */
  wrong_pinyin?: string;
  right_pinyin?: string;
  note_en: string;
  note_ar: string;
}

export interface GrammarPoint {
  id: string;
  lesson_id: string | null;     // null in fallback content (mapped by lesson order)
  order_num: number;
  title_en: string;
  title_ar: string;
  /** Chinese sentence structure pattern, e.g. "A 是 B" or "Subject + 在 + Place + Verb" */
  pattern: string;
  explanation_en: string;
  explanation_ar: string;
  usage_en: string;             // when to use this grammar
  usage_ar: string;
  formal_note_en?: string | null; // formal vs casual usage when relevant
  formal_note_ar?: string | null;
  examples: GrammarExample[];
  common_mistakes: GrammarMistake[];
}

export interface GrammarExercise {
  id: string;
  grammar_point_id?: string | null;
  lesson_id?: string | null;
  order_num: number;
  type: GrammarExerciseType;
  prompt_en: string;
  prompt_ar: string;
  /** Optional stem sentence shown above the task (e.g. the sentence to transform) */
  chinese?: string | null;
  /** word bank for word_order exercises */
  words?: string[] | null;
  /** options for choice-based exercises */
  options?: string[] | null;
  /** the correct option text, or the correct full sentence for word_order */
  correct: string;
  /** V2.0.4: pinyin of the correct (full) answer, shown after answering */
  correct_pinyin?: string | null;
  /** V2.0.4: pairs for match_* exercise types */
  pairs?: { left: string; right: string }[] | null;
  explanation_en?: string | null;
  explanation_ar?: string | null;
}

export interface LessonGrammar {
  points: GrammarPoint[];
  exercises: GrammarExercise[];
  /** where the content came from — lets the UI mention fallback mode if needed */
  source: 'database' | 'fallback' | 'empty';
}
