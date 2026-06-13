import { useState, useRef, useEffect } from 'react';
import { trackActivity } from '@/lib/gamification';
import { Eraser, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import AudioButton from '@/components/AudioButton';
import type { VocabRow } from '@/types/supabase';
import { hanziByChar } from '@/data/hanziMemory';
import CharacterMemoryCard from '@/components/CharacterMemoryCard';
import StrokeOrderPlayer from '@/components/StrokeOrderPlayer';

interface WritingPadProps {
  vocabulary: VocabRow[];
}

const INK_COLORS = [
  { name: 'red', value: '#c0392b' },
  { name: 'dark', value: '#2c2c34' },
] as const;

/**
 * V2 Writing practice: light paper-style canvas with a 田字格 guide grid,
 * the selected character shown above, a character selector from lesson
 * vocabulary, red/dark ink, Clear / Next, and a simple coverage-based score.
 */
export default function WritingPad({ vocabulary }: WritingPadProps) {
  const { t } = useI18n();
  const chars = vocabulary.filter(v => v.chinese);
  const [index, setIndex] = useState(0);
  const [ink, setInk] = useState<string>(INK_COLORS[0].value);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [gridType, setGridType] = useState<'tian' | 'mi' | 'none'>('mi'); // V2.0.5: 田字格 / 米字格 / none
  const [padMode, setPadMode] = useState<'free' | 'strokes'>('free');     // V2.0.5: free writing vs stroke order
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const current = chars[index];

  const drawGuides = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    // Paper background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fdf8ef';
    ctx.fillRect(0, 0, w, h);
    // Border
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    // Guide grid: 田字格 (cross) / 米字格 (cross + diagonals) / none
    if (gridType !== 'none') {
      ctx.save();
      ctx.strokeStyle = '#e3b9b0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(w / 2, 6); ctx.lineTo(w / 2, h - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, h / 2); ctx.lineTo(w - 6, h / 2); ctx.stroke();
      if (gridType === 'mi') {
        ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(w - 6, h - 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w - 6, 6); ctx.lineTo(6, h - 6); ctx.stroke();
      }
      ctx.restore();
    }
    // Faint reference character to trace
    if (current) {
      ctx.save();
      ctx.fillStyle = 'rgba(120, 110, 95, 0.16)';
      ctx.font = `${Math.floor(h * 0.72)}px "Noto Serif SC", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current.chinese.charAt(0), w / 2, h / 2 + h * 0.02);
      ctx.restore();
    }
  };

  // Redraw guides whenever the character changes
  useEffect(() => {
    drawGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, gridType, padMode]);

  const selectChar = (i: number) => {
    setIndex(i);
    setHasDrawn(false);
    setFeedback(null);
  };

  const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    // Map CSS pixels to canvas pixels (canvas is responsive)
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(e);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingRef.current = true;
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stop = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext('2d')?.closePath();
  };

  const clear = () => {
    drawGuides();
    setHasDrawn(false);
    setFeedback(null);
  };

  /** Simple scoring: enough ink coverage inside the writing area → "Good practice". */
  const checkWriting = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (!hasDrawn) {
      setFeedback(t('writing.tryFirst'));
      return;
    }
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let inkPixels = 0;
    // Sample every 4th pixel for speed; count strongly-colored (ink) pixels
    for (let i = 0; i < img.length; i += 16) {
      const r = img[i], g = img[i + 1], b = img[i + 2];
      const isRedInk = r > 130 && g < 100 && b < 100;
      const isDarkInk = r < 90 && g < 90 && b < 110;
      if (isRedInk || isDarkInk) inkPixels++;
    }
    const coverage = inkPixels / (img.length / 16);
    setFeedback(coverage > 0.01 ? t('writing.good') : t('writing.tryFirst'));
    if (coverage > 0.01) trackActivity('chars_written');
  };

  const nextChar = () => {
    if (chars.length === 0) return;
    selectChar((index + 1) % chars.length);
  };

  if (chars.length === 0) {
    return <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('writing.empty')}</p>;
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Selected character header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-4 liquid-glass px-6 py-3 rounded-2xl">
          <span className="font-chinese text-5xl text-white">{current.chinese}</span>
          <div className="text-left">
            <p className="text-sm text-[#FF3333] font-semibold">{current.pinyin}</p>
            <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{current.arabic}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{current.english}</p>
          </div>
          <AudioButton text={current.chinese} size="sm" />
        </div>
      </div>

      {/* Character selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {chars.map((v, i) => (
          <button
            key={v.id}
            onClick={() => selectChar(i)}
            className={`px-3 py-1.5 rounded-lg font-chinese text-lg transition-colors ${
              i === index ? 'bg-[#FF3333] text-white' : 'bg-white/[0.05] text-white hover:bg-[#FF3333]/20'
            }`}
          >
            {v.chinese}
          </button>
        ))}
      </div>

      {/* V2.0.5: mode + grid toggles */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <div className="flex gap-1 liquid-glass rounded-xl p-1">
          <button onClick={() => setPadMode('free')} className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors ${padMode === 'free' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] hover:text-white'}`}>{t('writing.freeMode')}</button>
          <button onClick={() => setPadMode('strokes')} className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors ${padMode === 'strokes' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] hover:text-white'}`}>{t('writing.strokeMode')}</button>
        </div>
        {padMode === 'free' && (
          <div className="flex gap-1 liquid-glass rounded-xl p-1">
            {([['mi', '米'], ['tian', '田'], ['none', '—']] as const).map(([g, label]) => (
              <button key={g} onClick={() => setGridType(g)} className={`px-3 py-1.5 rounded-lg text-xs font-chinese transition-colors ${gridType === g ? 'bg-white/15 text-white' : 'text-[#888] hover:text-white'}`}>{label}</button>
            ))}
          </div>
        )}
      </div>

      {padMode === 'strokes' && current ? (
        <StrokeOrderPlayer key={current.chinese.charAt(0)} character={current.chinese.charAt(0)} size={260} />
      ) : (
      <>
      {/* Paper canvas */}
      <div className="rounded-2xl overflow-hidden shadow-lg mx-auto" style={{ maxWidth: 420 }}>
        <canvas
          ref={canvasRef}
          width={420}
          height={420}
          className="w-full h-auto touch-none cursor-crosshair block"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={stop}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <div className="flex items-center gap-2 liquid-glass rounded-xl px-3 py-2">
          {INK_COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => setInk(c.value)}
              aria-label={c.name}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${ink === c.value ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <button onClick={clear} className="btn-secondary text-sm py-2 px-4"><Eraser size={14} /> {t('writing.clear')}</button>
        <button onClick={checkWriting} className="btn-secondary text-sm py-2 px-4"><CheckCircle2 size={14} /> {t('writing.check')}</button>
        <button onClick={nextChar} className="btn-primary text-sm py-2 px-4">{t('writing.next')} <ArrowRight size={14} /></button>
      </div>

      {feedback && (
        <p className="text-center mt-3 text-sm font-semibold" style={{ color: feedback === t('writing.good') ? '#10b981' : '#f59e0b' }}>
          {feedback}
        </p>
      )}

      </>
      )}

      {/* V2.0.4: "Remember the Character" — memory story for the current character */}
      {current && hanziByChar[current.chinese.charAt(0)] && (
        <div className="mt-6">
          <CharacterMemoryCard item={hanziByChar[current.chinese.charAt(0)]} compact />
        </div>
      )}
    </div>
  );
}
