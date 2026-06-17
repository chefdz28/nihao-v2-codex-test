// V3.7 — AI Teacher Agent (deterministic, NO paid AI API, no secrets). Builds a
// "smart teacher" experience entirely from existing NiHao data: the dictionary,
// the HSK simulation banks, and writing characters. Everything is original local
// content already in the app; this engine just selects + arranges it per the
// student's level + goal. A later V3.8 can swap in a real AI via an Edge Function.
import { dictionaryWords, type DictWord } from '@/data/dictionaryCore';
import { HSK1_QUESTIONS } from '@/data/hsk1sim';
import { HSK2_QUESTIONS } from '@/data/hsk2sim';
import { HSK3_QUESTIONS } from '@/data/hsk3sim';

export type TeacherLevel = 'beginner' | 'hsk1' | 'hsk2' | 'hsk3';
export type TeacherGoal = 'daily_words' | 'hsk_test' | 'pinyin' | 'writing' | 'review';

export interface TeacherWord { hanzi: string; pinyin: string; ar: string; example: string }
export interface TeacherQuiz { question: string; choices: string[]; answer: string; explanation: string }
export interface TeacherRoute { label: string; href: string }

export interface TeacherPlan {
  level: TeacherLevel;
  goal: TeacherGoal;
  title: string;
  recommendedMinutes: number;
  steps: string[];
  words: TeacherWord[];
  quiz: TeacherQuiz[];
  recommendedRoutes: TeacherRoute[];
}

// ---- labels ----
export const LEVEL_LABEL: Record<TeacherLevel, string> = {
  beginner: 'مبتدئ', hsk1: 'HSK1', hsk2: 'HSK2', hsk3: 'HSK3',
};
export const GOAL_LABEL: Record<TeacherGoal, string> = {
  daily_words: 'كلمات يومية',
  hsk_test: 'التحضير لاختبار HSK',
  pinyin: 'تدريب البينين',
  writing: 'تدريب الكتابة',
  review: 'مراجعة الأخطاء',
};

// Map a teacher level to the dictionary HSK band (beginner ≈ HSK1).
function hskBand(level: TeacherLevel): 1 | 2 | 3 {
  return level === 'hsk2' ? 2 : level === 'hsk3' ? 3 : 1;
}

// Deterministic "day index" so the same day shows the same picks (stable, not
// random) but rotates daily for variety.
function dayIndex(date: Date): number {
  return Math.floor(date.getTime() / 86400000);
}

// Pick N items starting at a deterministic offset (rotates per day + salt).
function pickRotating<T>(arr: T[], n: number, offset: number): T[] {
  if (arr.length === 0) return [];
  const out: T[] = [];
  for (let i = 0; i < Math.min(n, arr.length); i++) {
    out.push(arr[(offset + i) % arr.length]);
  }
  return out;
}

function wordsForLevel(level: TeacherLevel): DictWord[] {
  const band = hskBand(level);
  // prefer words with examples, but fall back to all band words (HSK1 lesson
  // vocab often has no example field) so the lesson is never empty
  const all = dictionaryWords.filter(w => w.hsk === band);
  const withEx = all.filter(w => w.examples && w.examples.length > 0);
  return withEx.length >= 3 ? withEx : all;
}

function simForLevel(level: TeacherLevel) {
  const band = hskBand(level);
  return band === 2 ? HSK2_QUESTIONS : band === 3 ? HSK3_QUESTIONS : HSK1_QUESTIONS;
}

// Build a 3-word mini lesson from the dictionary for this level.
function buildWords(level: TeacherLevel, offset: number): TeacherWord[] {
  const pool = wordsForLevel(level);
  const picks = pickRotating(pool, 3, offset);
  return picks.map(w => ({
    hanzi: w.chinese,
    pinyin: w.pinyin,
    ar: w.arabic,
    // use a real example if present; otherwise a simple original sentence
    example: (w.examples && w.examples[0]?.zh) ? w.examples[0].zh : `这是 ${w.chinese}。`,
  }));
}

// Build a 3-question quiz. For 'review' or 'hsk_test' goals, pull reading
// questions from the simulation bank (real practice items). Otherwise build
// "meaning of X" questions from the mini-lesson words.
function buildQuiz(level: TeacherLevel, goal: TeacherGoal, words: TeacherWord[], offset: number): TeacherQuiz[] {
  if (goal === 'hsk_test' || goal === 'review') {
    const sim = simForLevel(level).filter(q => q.part === 'reading' && q.options.length >= 2);
    const picks = pickRotating(sim, 3, offset);
    if (picks.length === 3) {
      return picks.map(q => ({
        question: q.q_ar + (q.chinese ? ` (${q.chinese})` : ''),
        choices: q.options,
        answer: q.correct,
        explanation: q.pinyin ? `الإجابة الصحيحة: ${q.correct} — ${q.pinyin}` : `الإجابة الصحيحة: ${q.correct}`,
      }));
    }
  }
  // default: meaning questions from the lesson words + distractors from the pool
  const pool = wordsForLevel(level);
  return words.map((w, i) => {
    const distractors = pickRotating(pool.filter(p => p.chinese !== w.hanzi), 2, offset + i * 7).map(p => p.arabic);
    const choices = shuffleStable([w.ar, ...distractors], offset + i);
    return {
      question: `ما معنى ${w.hanzi}؟`,
      choices,
      answer: w.ar,
      explanation: `${w.hanzi} (${w.pinyin}) تعني «${w.ar}».`,
    };
  });
}

// Stable shuffle (deterministic by seed) so options don't reshuffle on re-render.
function shuffleStable<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Goal-specific steps + recommended internal routes.
function buildStepsAndRoutes(level: TeacherLevel, goal: TeacherGoal): { steps: string[]; routes: TeacherRoute[]; minutes: number } {
  const simRoute: TeacherRoute = { label: `محاكاة ${LEVEL_LABEL[level === 'beginner' ? 'hsk1' : level]}`, href: `/hsk${hskBand(level)}-simulation` };
  const dict: TeacherRoute = { label: 'القاموس', href: '/dictionary' };
  const daily: TeacherRoute = { label: 'درس اليوم', href: '/daily' };
  const writing: TeacherRoute = { label: 'تدريب الكتابة', href: '/writing-practice' };
  const flash: TeacherRoute = { label: 'بطاقات HSK3', href: '/flashcards/hsk3' };
  const sheet: TeacherRoute = { label: 'ورقة عمل HSK3', href: '/worksheets/hsk3' };
  const tests: TeacherRoute = { label: 'كل اختبارات HSK', href: '/hsk-tests' };
  const mistakes: TeacherRoute = { label: 'دفتر الأخطاء', href: '/mistakes' };

  switch (goal) {
    case 'daily_words':
      return {
        minutes: 15,
        steps: ['راجع 3 كلمات جديدة بالأسفل', 'اقرأ المثال لكل كلمة بصوت عالٍ', 'أجب على الاختبار القصير', 'أكمل درس اليوم لمزيد من الكلمات'],
        routes: [daily, dict, flash],
      };
    case 'hsk_test':
      return {
        minutes: 20,
        steps: ['راجع كلمات المستوى', 'تدرّب على أسئلة بنمط الاختبار', 'أجب على الاختبار القصير', `افتح محاكاة ${LEVEL_LABEL[level === 'beginner' ? 'hsk1' : level]} الكاملة`],
        routes: [simRoute, tests, dict],
      };
    case 'pinyin':
      return {
        minutes: 12,
        steps: ['انظر إلى البينين لكل كلمة', 'انطق كل كلمة ببطء', 'استمع وكرّر', 'أجب على الاختبار القصير'],
        routes: [{ label: 'دليل البينين', href: '/pinyin' }, dict, daily],
      };
    case 'writing':
      return {
        minutes: 15,
        steps: ['راجع الكلمات وأحرفها', 'تدرّب على ترتيب الكتابة', 'اكتب كل حرف 3 مرات', 'أجب على الاختبار القصير'],
        routes: [writing, sheet, dict],
      };
    case 'review':
      return {
        minutes: 15,
        steps: ['راجع كلمات المستوى', 'أجب على أسئلة المراجعة', 'افتح دفتر الأخطاء لتصحيح ما فاتك', 'أعد محاولة المحاكاة'],
        routes: [mistakes, simRoute, dict],
      };
  }
}

/** Main entry: produce a deterministic study plan for today. */
export function generateTeacherPlan(input: {
  level: TeacherLevel;
  goal: TeacherGoal;
  date?: Date;
}): TeacherPlan {
  const date = input.date || new Date();
  const offset = dayIndex(date) + input.level.length + input.goal.length;
  const words = buildWords(input.level, offset);
  const quiz = buildQuiz(input.level, input.goal, words, offset);
  const { steps, routes, minutes } = buildStepsAndRoutes(input.level, input.goal);

  return {
    level: input.level,
    goal: input.goal,
    title: `خطة ${LEVEL_LABEL[input.level]} لليوم — ${GOAL_LABEL[input.goal]}`,
    recommendedMinutes: minutes,
    steps,
    words,
    quiz,
    recommendedRoutes: routes,
  };
}

// V3.7.1 — deterministic intent detection for the chat UI. Maps a free-text
// message (Arabic or English) to a level + goal + action. NO AI/API — pure
// keyword matching. Returns what the teacher should do next.
export type TeacherAction = 'plan' | 'words' | 'quiz' | 'pinyin' | 'writing' | 'tones' | 'review' | 'help';

export interface TeacherIntent {
  level?: TeacherLevel;
  goal?: TeacherGoal;
  action: TeacherAction;
}

export function detectIntent(raw: string): TeacherIntent {
  const s = (raw || '').toLowerCase();
  const has = (...subs: string[]) => subs.some(x => s.includes(x));

  // level
  let level: TeacherLevel | undefined;
  if (has('hsk1', 'hsk 1', 'اتش اس كي 1', 'اچ اس كي 1', 'مستوى 1', 'المستوى الأول')) level = 'hsk1';
  else if (has('hsk2', 'hsk 2', 'مستوى 2', 'المستوى الثاني')) level = 'hsk2';
  else if (has('hsk3', 'hsk 3', 'مستوى 3', 'المستوى الثالث')) level = 'hsk3';
  else if (has('مبتدئ', 'beginner', 'بداية', 'جديد')) level = 'beginner';

  // action + goal (order matters: most specific first)
  if (has('بينين', 'pinyin', 'البينين')) return { level, goal: 'pinyin', action: 'pinyin' };
  if (has('نغم', 'نبرة', 'tone', 'tones', 'النغمات')) return { level, goal: 'pinyin', action: 'tones' };
  if (has('كتابة', 'اكتب', 'writing', 'write', 'أحرف', 'حروف')) return { level, goal: 'writing', action: 'writing' };
  if (has('مراجعة', 'أخطاء', 'اخطائي', 'mistakes', 'review', 'راجع')) return { level, goal: 'review', action: 'review' };
  if (has('اختبر', 'اختبار', 'امتحان', 'quiz', 'test', 'محاكاة')) return { level, goal: 'hsk_test', action: 'quiz' };
  if (has('كلمات', 'كلمة', 'words', 'word', 'مفردات', 'vocab')) return { level, goal: 'daily_words', action: 'words' };
  if (has('خطة', 'plan', 'اليوم', 'today', 'برنامج')) return { level, goal: undefined, action: 'plan' };

  // a bare level with no action → give a plan for that level
  if (level) return { level, goal: undefined, action: 'plan' };

  return { action: 'help' };
}
