import { useRef, useState } from 'react';
import { Mic, Square, Play } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

/**
 * V2.8C — one shared voice-practice control for stories AND dialogues.
 * Wraps the mobile-safe useVoiceRecorder hook (iOS MIME detection). LOCAL ONLY:
 * record → stop → play back → retry. No Supabase, no upload, no storage.
 * Does NOT touch story speechSynthesis audio — it only handles the user's mic.
 *
 * Arabic buttons: "سجّل صوتك" / "أوقف التسجيل" / "استمع إلى تسجيلك" / "أعد المحاولة".
 */
export default function VoicePractice({ compact = false }: { compact?: boolean }) {
  const recorder = useVoiceRecorder();
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const [playbackError, setPlaybackError] = useState(false);

  if (!recorder.supported) {
    return (
      <p className="text-[11px] text-center font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>
        التسجيل غير مدعوم في هذا المتصفح. جرّب Safari أو Chrome محدّث.
      </p>
    );
  }

  const toggle = async () => {
    setPlaybackError(false);
    if (recorder.isRecording) recorder.stop();
    else await recorder.start();
  };

  const playRecording = async () => {
    setPlaybackError(false);
    const el = playbackRef.current;
    if (!el) return;
    try { el.currentTime = 0; await el.play(); }
    catch { setPlaybackError(true); }
  };

  const retry = async () => {
    setPlaybackError(false);
    recorder.reset();
    await recorder.start();
  };

  return (
    <div className={compact ? '' : 'liquid-glass rounded-2xl p-4'}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={toggle}
          disabled={recorder.state === 'requesting' || recorder.state === 'processing'}
          className={`text-sm py-2.5 px-5 rounded-xl font-display font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60 ${recorder.isRecording ? 'bg-[#FF3333] text-white animate-pulse' : 'bg-white/5 hover:bg-white/10 text-white'}`}
        >
          {recorder.isRecording
            ? <><Square size={13} /> أوقف التسجيل</>
            : recorder.state === 'requesting'
              ? <>اسمح بالميكروفون…</>
              : recorder.state === 'processing'
                ? <>جارٍ المعالجة…</>
                : <><Mic size={13} /> سجّل صوتك</>}
        </button>

        {recorder.recordUrl && !recorder.isRecording && (
          <>
            <button onClick={playRecording} className="text-sm py-2.5 px-5 rounded-xl font-display font-bold bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#10b981] transition-colors flex items-center gap-1.5">
              <Play size={13} /> استمع إلى تسجيلك
            </button>
            <button onClick={retry} className="text-sm py-2.5 px-4 rounded-xl font-display font-bold bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-1.5">
              <Mic size={13} /> أعد المحاولة
            </button>
          </>
        )}
      </div>

      {/* hidden audio element so we can catch play() failures */}
      {recorder.recordUrl && (
        <audio ref={playbackRef} src={recorder.recordUrl} controls onError={() => setPlaybackError(true)} className="w-full max-w-[280px] mx-auto block h-9 mt-3" />
      )}

      {recorder.state === 'error' && recorder.error && (
        <p className="text-[12px] text-center mt-2 text-[#FF3333] font-arabic">{recorder.error}</p>
      )}
      {playbackError && (
        <p className="text-[12px] text-center mt-2 text-[#FF3333] font-arabic">
          تم التسجيل، لكن المتصفح لم يستطع تشغيل التسجيل. جرّب Safari أو Chrome محدث.
        </p>
      )}
      <p className="text-[11px] text-center mt-2 font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>
        إذا لم يعمل التسجيل، تأكد من السماح للميكروفون وفتح الموقع عبر HTTPS.
      </p>
    </div>
  );
}
