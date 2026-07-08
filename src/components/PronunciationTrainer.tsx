import { useState, useRef, useCallback } from 'react';
import { Volume2, Mic, Square, Check, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { useAuth } from '@/contexts/AuthContext';
import { checkPronunciation, HSK1_SENTENCES, type Verdict } from '@/lib/pronunciation';
import { trackEvent } from '@/lib/analytics';

type Phase = 'idle' | 'recording' | 'checking' | 'result' | 'error';

const VERDICT_UI: Record<Verdict, { label: string; color: string; emoji: string }> = {
  great:    { label: 'نطق ممتاز!', color: '#10b981', emoji: '🎉' },
  close:    { label: 'قريب جداً — حاول مرة أخرى', color: '#f59e0b', emoji: '👍' },
  tryagain: { label: 'لم أفهم النطق جيداً، جرّب ثانية', color: '#FF3333', emoji: '🔁' },
};

/** V3.16 — Chinese pronunciation trainer. Student hears the sentence (TTS),
 *  records themselves, and Groq Whisper (via Edge Function) checks it. */
export default function PronunciationTrainer() {
  const { isPlaying, play } = useAudio();
  const { isAuthenticated } = useAuth();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>('tryagain');
  const [errMsg, setErrMsg] = useState('');

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const sentence = HSK1_SENTENCES[idx];

  const reset = () => { setPhase('idle'); setHeard(''); setScore(0); setErrMsg(''); };
  const go = (d: number) => {
    setIdx(i => (i + d + HSK1_SENTENCES.length) % HSK1_SENTENCES.length);
    reset();
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const startRecording = useCallback(async () => {
    if (!isAuthenticated) { setErrMsg('سجّل الدخول لاستخدام تدريب النطق.'); setPhase('error'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setPhase('checking');
        trackEvent('pronunciation_attempt', { sentence: sentence.hanzi });
        const res = await checkPronunciation(blob, sentence.hanzi);
        if (res.ok && res.verdict) {
          setHeard(res.heard || ''); setScore(res.score || 0); setVerdict(res.verdict);
          setPhase('result');
          trackEvent('pronunciation_result', { verdict: res.verdict, score: res.score });
        } else if (res.error === 'daily_limit') {
          setErrMsg('وصلت للحد اليومي من محاولات النطق. ارجع غداً 🙂'); setPhase('error');
        } else if (res.error === 'not_configured') {
          setErrMsg('ميزة النطق غير مفعّلة بعد. تواصل مع الإدارة.'); setPhase('error');
        } else {
          setErrMsg('تعذّر تحليل الصوت. تأكد من الميكروفون وحاول مجدداً.'); setPhase('error');
        }
      };
      mr.start();
      mediaRef.current = mr;
      setPhase('recording');
    } catch {
      setErrMsg('لم أتمكّن من الوصول للميكروفون. اسمح بالإذن وحاول مجدداً.');
      setPhase('error');
    }
  }, [isAuthenticated, sentence.hanzi]);

  const stopRecording = () => {
    mediaRef.current?.stop();
    mediaRef.current = null;
  };

  const v = VERDICT_UI[verdict];

  return (
    <div className="liquid-glass rounded-3xl p-6 max-w-lg mx-auto" dir="rtl">
      {/* nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => go(-1)} className="icon-btn" aria-label="السابق"><ChevronRight size={18} /></button>
        <span className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>
          {idx + 1} / {HSK1_SENTENCES.length}
        </span>
        <button onClick={() => go(1)} className="icon-btn" aria-label="التالي"><ChevronLeft size={18} /></button>
      </div>

      {/* the sentence */}
      <div className="text-center mb-6">
        <p className="font-chinese text-white mb-2" style={{ fontSize: 'clamp(2.2rem, 8vw, 3.5rem)' }}>{sentence.hanzi}</p>
        <p className="text-[#FF6666] font-display text-lg mb-1" dir="ltr">{sentence.pinyin}</p>
        <p className="font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{sentence.arabic}</p>
      </div>

      {/* listen */}
      <div className="flex justify-center mb-6">
        <button onClick={() => play(sentence.hanzi, 'zh-CN')} disabled={isPlaying}
          className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] transition-colors rounded-xl px-4 py-2.5 font-arabic text-sm text-white">
          <Volume2 size={16} className="text-[#FF3333]" /> استمع للنطق الصحيح
        </button>
      </div>

      {/* record / states */}
      <div className="text-center">
        {phase === 'idle' && (
          <button onClick={startRecording}
            className="inline-flex items-center gap-2 btn-primary py-3 px-6 font-arabic">
            <Mic size={18} /> سجّل نطقك
          </button>
        )}

        {phase === 'recording' && (
          <button onClick={stopRecording}
            className="inline-flex items-center gap-2 bg-[#FF3333] text-white rounded-xl py-3 px-6 font-arabic animate-pulse">
            <Square size={18} /> إيقاف التسجيل
          </button>
        )}

        {phase === 'checking' && (
          <div className="inline-flex items-center gap-2 font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
            <Loader2 size={18} className="animate-spin text-[#FF3333]" /> جارٍ تحليل نطقك…
          </div>
        )}

        {phase === 'result' && (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{v.emoji}</span>
              <span className="font-display font-bold text-lg" style={{ color: v.color }}>{v.label}</span>
            </div>
            {/* score bar */}
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden max-w-[240px] mx-auto mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: v.color }} />
            </div>
            <p className="text-xs font-arabic mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
              دقّة النطق: {score}%{heard ? ` · سمعت: ${heard}` : ''}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => { reset(); startRecording(); }} className="inline-flex items-center gap-1.5 btn-primary py-2 px-4 text-sm font-arabic">
                <RotateCcw size={15} /> حاول ثانية
              </button>
              {verdict === 'great' && (
                <button onClick={() => go(1)} className="inline-flex items-center gap-1.5 bg-[#10b981] text-white rounded-xl py-2 px-4 text-sm font-arabic">
                  <Check size={15} /> التالي
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div>
            <p className="font-arabic text-sm mb-3" style={{ color: '#FF6666' }}>{errMsg}</p>
            <button onClick={reset} className="inline-flex items-center gap-1.5 btn-primary py-2 px-4 text-sm font-arabic">
              <RotateCcw size={15} /> حسناً
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
