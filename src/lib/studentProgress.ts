// V2.9B — student progress service. Talks to Supabase (student_progress) when a
// user is logged in; otherwise falls back to localStorage so guests can still
// track locally and see a "sign in to save" prompt. No voice/audio is stored.
import { supabase } from '@/lib/supabase';

export type ContentType = 'lesson' | 'story' | 'dialogue' | 'quiz' | 'daily';

export interface ProgressRow {
  id?: string;
  user_id?: string;
  content_type: ContentType;
  content_slug: string;
  status: string;
  score?: number | null;
  completed_at?: string | null;
  updated_at?: string;
}

// XP per content type (Scope 5)
export const XP_BY_TYPE: Record<ContentType, number> = {
  lesson: 10,
  story: 15,
  dialogue: 15,
  quiz: 10,
  daily: 20,
};

const TABLE = 'student_progress';
const LS_KEY = 'nihao_progress_guest_v1';

function lsLoad(): ProgressRow[] {
  try { return JSON.parse(window.localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsSave(rows: ProgressRow[]) {
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(rows)); } catch { /* private mode */ }
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch { return null; }
}

/** All progress rows for the current user (or guest localStorage). */
export async function getProgress(): Promise<ProgressRow[]> {
  const uid = await currentUserId();
  if (!uid) return lsLoad();
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', uid).order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as ProgressRow[];
  } catch {
    return lsLoad();
  }
}

/** Mark a piece of content complete (idempotent on type+slug). */
export async function markCompleted(content_type: ContentType, content_slug: string, score?: number): Promise<void> {
  const uid = await currentUserId();
  const now = new Date().toISOString();
  if (!uid) {
    const rows = lsLoad();
    const i = rows.findIndex(r => r.content_type === content_type && r.content_slug === content_slug);
    const row: ProgressRow = { content_type, content_slug, status: 'completed', score: score ?? null, completed_at: now, updated_at: now };
    if (i >= 0) rows[i] = row; else rows.push(row);
    lsSave(rows);
    return;
  }
  try {
    await supabase.from(TABLE).upsert({
      user_id: uid, content_type, content_slug, status: 'completed',
      score: score ?? null, completed_at: now,
    }, { onConflict: 'user_id,content_type,content_slug' });
  } catch { /* best-effort; UI stays responsive */ }
}

/** Remove a completion. */
export async function unmarkCompleted(content_type: ContentType, content_slug: string): Promise<void> {
  const uid = await currentUserId();
  if (!uid) {
    lsSave(lsLoad().filter(r => !(r.content_type === content_type && r.content_slug === content_slug)));
    return;
  }
  try {
    await supabase.from(TABLE).delete().eq('user_id', uid).eq('content_type', content_type).eq('content_slug', content_slug);
  } catch { /* best-effort */ }
}

/** Is a specific item completed? (single lookup helper) */
export async function isCompleted(content_type: ContentType, content_slug: string): Promise<boolean> {
  const rows = await getProgress();
  return rows.some(r => r.content_type === content_type && r.content_slug === content_slug && r.status === 'completed');
}

/** Most recent N completions. */
export async function getRecentActivity(limit = 8): Promise<ProgressRow[]> {
  const rows = await getProgress();
  return rows
    .filter(r => r.status === 'completed')
    .sort((a, b) => (b.completed_at || b.updated_at || '').localeCompare(a.completed_at || a.updated_at || ''))
    .slice(0, limit);
}

export interface ProgressSummary {
  lessons: number; stories: number; dialogues: number; quizzes: number; daily: number;
  total: number; xp: number;
}

/** Counts per type + total XP. */
export async function getSummary(): Promise<ProgressSummary> {
  const rows = (await getProgress()).filter(r => r.status === 'completed');
  const count = (t: ContentType) => rows.filter(r => r.content_type === t).length;
  const lessons = count('lesson'), stories = count('story'), dialogues = count('dialogue'),
    quizzes = count('quiz'), daily = count('daily');
  const xp = lessons * XP_BY_TYPE.lesson + stories * XP_BY_TYPE.story
    + dialogues * XP_BY_TYPE.dialogue + quizzes * XP_BY_TYPE.quiz + daily * XP_BY_TYPE.daily;
  return { lessons, stories, dialogues, quizzes, daily, total: rows.length, xp };
}
