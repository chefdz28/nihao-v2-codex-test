// Supabase Edge Function: pronunciation-check
// A SECURE proxy between the NiHao frontend and Groq's Whisper (speech-to-text).
// The Groq API key lives ONLY in Supabase secrets (GROQ_API_KEY) — never in the
// frontend. The student records themselves saying a Chinese sentence; this
// function sends the audio to Groq Whisper (open-source model, multilingual,
// great at Chinese), gets the transcription back, and compares it to the target
// sentence. The comparison is DETERMINISTIC (character overlap) — no extra AI.
//
// Groq free tier: 2000 audio requests/day, no credit card. Whisper Large v3
// Turbo, ~$0.04/hour if you upgrade later.
//
// Env (Supabase → Edge Functions → Secrets):
//   GROQ_API_KEY   — your Groq API key (free tier is fine to start)
//   (SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically)

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MODEL = 'whisper-large-v3-turbo';
const DAILY_LIMIT = 30;              // pronunciation attempts per user per day
const MAX_AUDIO_BYTES = 3_000_000;   // ~3MB cap (a short clip is far smaller)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Keep only Chinese characters (drop punctuation/spaces/latin) for a fair compare.
function hanOnly(s: string): string {
  return (s.match(/[\u4e00-\u9fff]/g) || []).join('');
}

// Deterministic similarity: proportion of target characters that appear (in
// order) in the transcription. 0..1.
function scoreMatch(target: string, heard: string): number {
  const t = hanOnly(target);
  const h = hanOnly(heard);
  if (!t) return 0;
  let hi = 0, matched = 0;
  for (const ch of t) {
    const idx = h.indexOf(ch, hi);
    if (idx >= 0) { matched++; hi = idx + 1; }
  }
  return matched / t.length;
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

    // ---- parse multipart form: audio blob + target text ----
    const form = await req.formData();
    const audio = form.get('audio');
    const target = String(form.get('target') || '').trim();
    if (!(audio instanceof File)) return json({ error: 'no_audio' }, 400);
    if (!target) return json({ error: 'no_target' }, 400);
    if (audio.size > MAX_AUDIO_BYTES) return json({ error: 'audio_too_large' }, 413);

    // ---- per-user daily rate limit (DB-enforced) ----
    const { data: used, error: rlErr } = await supabase.rpc('pronunciation_bump_usage');
    if (rlErr) {
      console.error('rate-limit rpc error', rlErr.message);
      return json({ error: 'rate_limit_unavailable' }, 503);
    }
    if (typeof used === 'number' && used > DAILY_LIMIT) {
      return json({ error: 'daily_limit', limit: DAILY_LIMIT }, 429);
    }

    // ---- call Groq Whisper ----
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (!groqKey) return json({ error: 'not_configured' }, 500);

    const groqForm = new FormData();
    groqForm.append('file', audio, 'speech.webm');
    groqForm.append('model', MODEL);
    groqForm.append('language', 'zh');            // Chinese
    groqForm.append('response_format', 'json');
    groqForm.append('temperature', '0');

    const groqResp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}` },
      body: groqForm,
    });

    if (!groqResp.ok) {
      const errText = await groqResp.text();
      console.error('groq error', groqResp.status, errText);
      if (groqResp.status === 429) return json({ error: 'provider_busy' }, 429);
      return json({ error: 'transcribe_failed' }, 502);
    }

    const data = await groqResp.json();
    const heard = String(data?.text || '').trim();
    const score = scoreMatch(target, heard);

    // verdict thresholds (deterministic)
    let verdict: 'great' | 'close' | 'tryagain';
    if (score >= 0.85) verdict = 'great';
    else if (score >= 0.5) verdict = 'close';
    else verdict = 'tryagain';

    return json({
      heard,
      score: Math.round(score * 100),
      verdict,
      remaining: Math.max(0, DAILY_LIMIT - (typeof used === 'number' ? used : 0)),
    });
  } catch (e) {
    console.error('pronunciation-check fatal', e);
    return json({ error: 'server_error' }, 500);
  }
});
