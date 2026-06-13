import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { Play, PenLine, RotateCcw, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';

interface StrokeOrderPlayerProps {
  character: string;   // single hanzi
  size?: number;
}

/**
 * V2.0.5 stroke-order player built on hanzi-writer (MIT).
 * - "Watch" animates the strokes in the correct order (looping once per tap).
 * - "Quiz" lets the learner draw each stroke; wrong strokes are corrected.
 * Character data loads from the jsDelivr CDN at runtime; if it cannot be
 * fetched (offline / unknown char), a friendly note is shown — never crashes.
 */
export default function StrokeOrderPlayer({ character, size = 220 }: StrokeOrderPlayerProps) {
  const { t } = useI18n();
  const holderRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [mode, setMode] = useState<'idle' | 'quiz'>('idle');

  useEffect(() => {
    if (!holderRef.current) return;
    holderRef.current.innerHTML = '';
    setStatus('loading');
    setMode('idle');
    const writer = HanziWriter.create(holderRef.current, character, {
      width: size,
      height: size,
      padding: 8,
      strokeColor: '#ffffff',
      radicalColor: '#FF3333',
      outlineColor: 'rgba(255,255,255,0.18)',
      drawingColor: '#FF3333',
      drawingWidth: 14,
      showCharacter: true,
      showOutline: true,
      delayBetweenStrokes: 220,
      strokeAnimationSpeed: 1,
      onLoadCharDataSuccess: () => setStatus('ready'),
      onLoadCharDataError: () => setStatus('error'),
    });
    writerRef.current = writer;
    return () => {
      try { writer.cancelQuiz(); } catch { /* noop */ }
      writerRef.current = null;
    };
  }, [character, size]);

  const animate = () => {
    const w = writerRef.current;
    if (!w || status !== 'ready') return;
    setMode('idle');
    try { w.cancelQuiz(); } catch { /* noop */ }
    w.showCharacter();
    w.animateCharacter();
  };

  const quiz = () => {
    const w = writerRef.current;
    if (!w || status !== 'ready') return;
    setMode('quiz');
    w.quiz({ showHintAfterMisses: 2 });
  };

  const reset = () => {
    const w = writerRef.current;
    if (!w || status !== 'ready') return;
    try { w.cancelQuiz(); } catch { /* noop */ }
    setMode('idle');
    w.showCharacter();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-2xl border border-white/10 bg-white/[0.03] relative"
        style={{ width: size, height: size }}
      >
        {/* 田字格 guide behind the writer */}
        <svg className="absolute inset-0 pointer-events-none" width={size} height={size}>
          <line x1={size / 2} y1="6" x2={size / 2} y2={size - 6} stroke="rgba(255,80,80,0.18)" strokeDasharray="6 6" />
          <line x1="6" y1={size / 2} x2={size - 6} y2={size / 2} stroke="rgba(255,80,80,0.18)" strokeDasharray="6 6" />
        </svg>
        <div ref={holderRef} className="absolute inset-0" />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Loader2 className="animate-spin" size={20} />
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('stroke.unavailable')}</p>
          </div>
        )}
      </div>

      {status === 'ready' && (
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <button onClick={animate} className="btn-primary text-xs py-2 px-4"><Play size={13} /> {t('stroke.watch')}</button>
          <button onClick={quiz} className={`text-xs py-2 px-4 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${mode === 'quiz' ? 'bg-[#FF3333] text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
            <PenLine size={13} /> {t('stroke.quiz')}
          </button>
          <button onClick={reset} className="btn-secondary text-xs py-2 px-4"><RotateCcw size={13} /> {t('grammar.reset')}</button>
        </div>
      )}
      {mode === 'quiz' && status === 'ready' && (
        <p className="text-[11px] mt-2 text-center" style={{ color: 'var(--color-text-tertiary)' }}>{t('stroke.quizHint')}</p>
      )}
    </div>
  );
}
