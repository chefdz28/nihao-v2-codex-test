// V3.16 — client for the Cohere-backed AI Teacher fallback. Calls the Supabase
// Edge Function `ai-teacher-cohere` (which holds the Cohere key server-side).
// The deterministic local teacher runs first; this is only used when it can't
// answer. Fails soft: any error returns null so the UI shows the safe fallback.
import { supabase } from '@/lib/supabase';

export interface CohereAnswer {
  answer: string;
  remaining?: number;
}

export type CohereError = 'daily_limit' | 'unauthorized' | 'not_configured' | 'offline' | 'error';

export interface CohereResult {
  ok: boolean;
  answer?: string;
  remaining?: number;
  error?: CohereError;
}

export interface CohereTurn { role: 'user' | 'assistant'; content: string }

/** Ask the Cohere-backed teacher. Requires a signed-in user (JWT sent
 *  automatically by supabase.functions.invoke). Returns a soft result. */
export async function askCohereTeacher(
  question: string,
  opts: { context?: string; level?: string; history?: CohereTurn[] } = {},
): Promise<CohereResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-teacher-cohere', {
      body: { question, context: opts.context, level: opts.level, history: opts.history },
    });
    if (error) {
      // supabase wraps non-2xx; try to read the status-specific error
      const status = (error as { context?: { status?: number } })?.context?.status;
      if (status === 429) return { ok: false, error: 'daily_limit' };
      if (status === 401) return { ok: false, error: 'unauthorized' };
      if (status === 500) return { ok: false, error: 'not_configured' };
      return { ok: false, error: 'error' };
    }
    if (data?.answer) return { ok: true, answer: data.answer as string, remaining: data.remaining };
    if (data?.error === 'daily_limit') return { ok: false, error: 'daily_limit' };
    return { ok: false, error: 'error' };
  } catch {
    return { ok: false, error: 'offline' };
  }
}

/** Read how many Cohere calls the user has used today (best-effort). */
export async function getAiTeacherUsageToday(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('ai_teacher_usage_today');
    if (error) return 0;
    return Number(data || 0);
  } catch {
    return 0;
  }
}
