// V2 learning helpers: XP system, progress utilities, daily path selection.
// Frontend-only calculations (no service role, no schema changes required).
import type { LessonRow, UserProgressItem, QuizResult } from '@/types/supabase';

export const XP_RULES = {
  lessonCompleted: 10,
  quizPassed: 20,
  pronunciationPractice: 5,
} as const;

/** Total XP from saved data: completed lessons + passed quizzes (+ optional pronunciation count). */
export function calculateXP(
  progress: UserProgressItem[],
  quizResults: QuizResult[],
  pronunciationCount = 0,
): number {
  const lessonXP = progress.filter(p => p.status === 'completed').length * XP_RULES.lessonCompleted;
  const quizXP = quizResults.filter(r => r.passed).length * XP_RULES.quizPassed;
  const pronXP = pronunciationCount * XP_RULES.pronunciationPractice;
  return lessonXP + quizXP + pronXP;
}

/** Set of completed lesson ids. */
export function completedLessonIds(progress: UserProgressItem[]): Set<string> {
  return new Set(progress.filter(p => p.status === 'completed').map(p => p.lesson_id));
}

/**
 * First incomplete lesson for a sorted-by-order_num lesson list.
 * Falls back to the first lesson when there is no progress.
 */
export function firstIncompleteLesson(
  lessons: LessonRow[],
  progress: UserProgressItem[],
): LessonRow | null {
  if (lessons.length === 0) return null;
  const done = completedLessonIds(progress);
  const sorted = [...lessons].sort((a, b) => a.order_num - b.order_num);
  return sorted.find(l => !done.has(l.id)) || sorted[0];
}

/** Per-level completion percentage (0–100). */
export function levelProgressPercent(
  levelLessons: LessonRow[],
  progress: UserProgressItem[],
): number {
  if (levelLessons.length === 0) return 0;
  const done = completedLessonIds(progress);
  const completed = levelLessons.filter(l => done.has(l.id)).length;
  return Math.round((completed / levelLessons.length) * 100);
}

/** Average quiz score percentage across results. */
export function averageQuizScore(quizResults: QuizResult[]): number {
  if (quizResults.length === 0) return 0;
  const sum = quizResults.reduce(
    (acc, r) => acc + (r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0),
    0,
  );
  return Math.round(sum / quizResults.length);
}

/** Lessons whose best quiz result is below the pass threshold — used by Review Mistakes. */
export function lowScoreLessons(
  quizResults: QuizResult[],
  threshold = 70,
): { lessonId: string; bestPercent: number; attempts: number; lastAt: string }[] {
  const byLesson = new Map<string, { best: number; attempts: number; lastAt: string }>();
  for (const r of quizResults) {
    const pct = r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
    const prev = byLesson.get(r.lesson_id);
    if (!prev) {
      byLesson.set(r.lesson_id, { best: pct, attempts: 1, lastAt: r.created_at });
    } else {
      byLesson.set(r.lesson_id, {
        best: Math.max(prev.best, pct),
        attempts: prev.attempts + 1,
        lastAt: prev.lastAt > r.created_at ? prev.lastAt : r.created_at,
      });
    }
  }
  return [...byLesson.entries()]
    .filter(([, v]) => v.best < threshold)
    .map(([lessonId, v]) => ({ lessonId, bestPercent: v.best, attempts: v.attempts, lastAt: v.lastAt }))
    .sort((a, b) => a.bestPercent - b.bestPercent);
}

/** Shuffle (Fisher–Yates) without mutating the source. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
