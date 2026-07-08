// V3.16 — pronunciation trainer client. Records the student, sends the audio to
// the Supabase Edge Function `pronunciation-check` (which holds the Groq key
// server-side and runs Whisper), and returns a deterministic verdict.
import { supabase } from '@/lib/supabase';

export type Verdict = 'great' | 'close' | 'tryagain';

export interface PronunciationResult {
  ok: boolean;
  heard?: string;
  score?: number;      // 0..100
  verdict?: Verdict;
  remaining?: number;
  error?: 'daily_limit' | 'unauthorized' | 'not_configured' | 'no_speech' | 'offline' | 'error';
}

/** Send recorded audio for a target sentence; get a verdict back. */
export async function checkPronunciation(audio: Blob, target: string): Promise<PronunciationResult> {
  try {
    const form = new FormData();
    form.append('audio', audio, 'speech.webm');
    form.append('target', target);
    const { data, error } = await supabase.functions.invoke('pronunciation-check', { body: form });
    if (error) {
      const status = (error as { context?: { status?: number } })?.context?.status;
      if (status === 429) return { ok: false, error: 'daily_limit' };
      if (status === 401) return { ok: false, error: 'unauthorized' };
      if (status === 500) return { ok: false, error: 'not_configured' };
      return { ok: false, error: 'error' };
    }
    if (data?.verdict) {
      return { ok: true, heard: data.heard, score: data.score, verdict: data.verdict, remaining: data.remaining };
    }
    if (data?.error === 'daily_limit') return { ok: false, error: 'daily_limit' };
    return { ok: false, error: 'error' };
  } catch {
    return { ok: false, error: 'offline' };
  }
}

export interface PracticeSentence {
  hanzi: string;
  pinyin: string;
  arabic: string;
}

// HSK1 practice sentences — short, high-frequency, good for pronunciation drills.
export const HSK1_SENTENCES: PracticeSentence[] = [
  { hanzi: '你好', pinyin: 'nǐ hǎo', arabic: 'مرحباً' },
  { hanzi: '谢谢', pinyin: 'xièxie', arabic: 'شكراً' },
  { hanzi: '再见', pinyin: 'zàijiàn', arabic: 'إلى اللقاء' },
  { hanzi: '我爱你', pinyin: 'wǒ ài nǐ', arabic: 'أحبك' },
  { hanzi: '你好吗', pinyin: 'nǐ hǎo ma', arabic: 'كيف حالك؟' },
  { hanzi: '我很好', pinyin: 'wǒ hěn hǎo', arabic: 'أنا بخير' },
  { hanzi: '对不起', pinyin: 'duìbùqǐ', arabic: 'آسف' },
  { hanzi: '没关系', pinyin: 'méi guānxi', arabic: 'لا بأس' },
  { hanzi: '我是学生', pinyin: 'wǒ shì xuéshēng', arabic: 'أنا طالب' },
  { hanzi: '这是什么', pinyin: 'zhè shì shénme', arabic: 'ما هذا؟' },
  { hanzi: '我喜欢中文', pinyin: 'wǒ xǐhuān zhōngwén', arabic: 'أحب اللغة الصينية' },
  { hanzi: '今天天气很好', pinyin: 'jīntiān tiānqì hěn hǎo', arabic: 'الطقس جميل اليوم' },
];
