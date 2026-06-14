import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * V2.7A.3 — mobile-safe voice recorder for the story "shadowing" feature.
 * Self-contained: this only handles the USER'S microphone recording + playback.
 * It does NOT touch story audio (which uses speechSynthesis elsewhere).
 *
 * The original bug: the Blob was always created as 'audio/webm', which iOS
 * Safari cannot record or play back (Safari produces audio/mp4). We now pick a
 * supported MIME via MediaRecorder.isTypeSupported and build the Blob with the
 * exact type the recorder actually used.
 */

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'processing' | 'ready' | 'error';

// Preference order; we fall back to no-mimeType if none report as supported.
const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',          // iOS/Safari
  'audio/mpeg',
];

function pickSupportedMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined; // let the browser choose its default
  }
  for (const m of MIME_CANDIDATES) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* ignore */ }
  }
  return undefined;
}

export interface VoiceRecorder {
  state: RecorderState;
  error: string | null;
  recordUrl: string | null;
  isRecording: boolean;
  supported: boolean;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useVoiceRecorder(): VoiceRecorder {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordUrl, setRecordUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeRef = useRef<string | undefined>(undefined);
  const urlRef = useRef<string | null>(null);

  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined';

  const cleanupStream = useCallback(() => {
    try { streamRef.current?.getTracks().forEach(tr => tr.stop()); } catch { /* noop */ }
    streamRef.current = null;
  }, []);

  const reset = useCallback(() => {
    if (urlRef.current) { try { URL.revokeObjectURL(urlRef.current); } catch { /* noop */ } urlRef.current = null; }
    setRecordUrl(null);
    setError(null);
    setState('idle');
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!supported) {
      setError('متصفحك لا يدعم تسجيل الصوت بهذه الصيغة.');
      setState('error');
      return;
    }
    setState('requesting');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: unknown) {
      const name = (e as { name?: string })?.name || '';
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        setError('تم رفض إذن الميكروفون. فعّل الميكروفون من إعدادات المتصفح.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
        setError('لم يتم العثور على ميكروفون.');
      } else {
        setError('تعذر الوصول إلى الميكروفون. تأكد من السماح للميكروفون وفتح الموقع عبر HTTPS.');
      }
      setState('error');
      return;
    }

    streamRef.current = stream;
    // clear any previous recording URL
    if (urlRef.current) { try { URL.revokeObjectURL(urlRef.current); } catch { /* noop */ } urlRef.current = null; }
    setRecordUrl(null);
    chunksRef.current = [];

    const mime = pickSupportedMime();
    mimeRef.current = mime;

    let rec: MediaRecorder;
    try {
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      // some browsers throw on unsupported options — retry with defaults
      try { rec = new MediaRecorder(stream); mimeRef.current = undefined; }
      catch {
        cleanupStream();
        setError('متصفحك لا يدعم تسجيل الصوت بهذه الصيغة.');
        setState('error');
        return;
      }
    }

    rec.ondataavailable = (e: BlobEvent) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      setState('processing');
      cleanupStream();
      // Build the Blob with the type the recorder actually used (key iOS fix).
      const type = mimeRef.current || rec.mimeType || '';
      const blob = type ? new Blob(chunksRef.current, { type }) : new Blob(chunksRef.current);
      if (!blob.size) {
        setError('تعذر تشغيل التسجيل. جرّب تحديث الصفحة.');
        setState('error');
        return;
      }
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setRecordUrl(url);
      setState('ready');
    };
    rec.onerror = () => {
      cleanupStream();
      setError('تعذر تشغيل التسجيل. جرّب تحديث الصفحة.');
      setState('error');
    };

    try {
      rec.start();
      recorderRef.current = rec;
      setState('recording');
    } catch {
      cleanupStream();
      setError('متصفحك لا يدعم تسجيل الصوت بهذه الصيغة.');
      setState('error');
    }
  }, [supported, cleanupStream]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try { rec.stop(); } catch { cleanupStream(); setState('idle'); }
    } else {
      cleanupStream();
    }
  }, [cleanupStream]);

  // cleanup on unmount
  useEffect(() => () => {
    try { if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop(); } catch { /* noop */ }
    try { streamRef.current?.getTracks().forEach(tr => tr.stop()); } catch { /* noop */ }
    if (urlRef.current) { try { URL.revokeObjectURL(urlRef.current); } catch { /* noop */ } }
  }, []);

  return {
    state, error, recordUrl,
    isRecording: state === 'recording',
    supported,
    start, stop, reset,
  };
}
