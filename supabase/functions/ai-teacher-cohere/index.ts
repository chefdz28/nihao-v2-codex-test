// Supabase Edge Function: ai-teacher-cohere
// A SECURE proxy between the NiHao frontend and the Cohere API. The Cohere API
// key lives ONLY in Supabase secrets (COHERE_API_KEY) — never in the frontend.
// The frontend calls this function; this function calls Cohere.
//
// Design:
//   - Auth required: only signed-in users (valid Supabase JWT) may call this.
//   - Per-user daily rate limit (default 15/day) enforced in the DB, so the
//     Cohere bill can't run away.
//   - The frontend already tried its deterministic local teacher first; this is
//     the smart fallback ONLY for questions the local teacher couldn't answer.
//   - Cohere Command R7B (cheap, multilingual) with a tight system prompt that
//     keeps answers on-topic (Arabic-speaking beginners learning Chinese) and
//     grounded in any local context the frontend passes in.
//
// Env (set in Supabase dashboard → Edge Functions → Secrets):
//   COHERE_API_KEY   — your Cohere production key
//   (SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically)

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const COHERE_URL = 'https://api.cohere.com/v2/chat';
const MODEL = 'command-r7b-12-2024';       // cheapest production Cohere model
const DAILY_LIMIT = 15;                      // Cohere calls per user per day
const MAX_QUESTION_LEN = 500;                // guard against huge prompts

interface Body {
  question?: string;
  context?: string;   // optional: local knowledge snippets the frontend found
  level?: string;     // beginner | intermediate | advanced
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    // ---- auth: require a signed-in Supabase user ----
    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
    const userId = userData.user.id;

    // ---- parse + validate ----
    const body = (await req.json()) as Body;
    const question = (body.question || '').trim().slice(0, MAX_QUESTION_LEN);
    const context = (body.context || '').trim().slice(0, 2000);
    const level = (body.level || 'beginner').slice(0, 20);
    if (!question) return json({ error: 'no_question' }, 400);

    // ---- per-user daily rate limit (DB-enforced) ----
    // Uses an RPC that atomically increments today's counter and returns the
    // new value (see migration 20260620_ai_teacher_usage.sql).
    const { data: used, error: rlErr } = await supabase.rpc('ai_teacher_bump_usage');
    if (rlErr) {
      console.error('rate-limit rpc error', rlErr.message);
      // fail closed on rate-limit errors to protect the bill
      return json({ error: 'rate_limit_unavailable' }, 503);
    }
    if (typeof used === 'number' && used > DAILY_LIMIT) {
      return json({ error: 'daily_limit', limit: DAILY_LIMIT }, 429);
    }

    // ---- build the Cohere request ----
    const cohereKey = Deno.env.get('COHERE_API_KEY');
    if (!cohereKey) return json({ error: 'not_configured' }, 500);

    const system = [
      'You are the NiHao AI Teacher, helping ARABIC-speaking beginners learn Chinese (Mandarin).',
      'ALWAYS answer in clear, simple Modern Standard Arabic. Keep answers short and practical.',
      'When you give a Chinese word, show: the characters, the pinyin (with tone marks), and the Arabic meaning.',
      'Focus on HSK1–HSK3 level. If asked something off-topic (not about Chinese/learning), gently redirect to Chinese learning.',
      'Never invent fake HSK rules. If unsure, say so briefly and suggest a NiHao tool (dictionary, HSK tests, writing practice).',
      level ? `The learner level is: ${level}.` : '',
      context ? `Relevant NiHao knowledge you may use:\n${context}` : '',
    ].filter(Boolean).join('\n');

    const cohereResp = await fetch(COHERE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!cohereResp.ok) {
      const errText = await cohereResp.text();
      console.error('cohere error', cohereResp.status, errText);
      return json({ error: 'cohere_failed' }, 502);
    }

    const data = await cohereResp.json();
    // Cohere v2 chat: message.content is an array of {type:'text', text}
    const answer = (data?.message?.content || [])
      .filter((c: { type?: string }) => c?.type === 'text')
      .map((c: { text?: string }) => c.text || '')
      .join('')
      .trim();

    if (!answer) return json({ error: 'empty_answer' }, 502);

    return json({ answer, remaining: Math.max(0, DAILY_LIMIT - (typeof used === 'number' ? used : 0)) });
  } catch (e) {
    console.error('ai-teacher-cohere fatal', e);
    return json({ error: 'server_error' }, 500);
  }
});
