import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { type PinyinMode } from '@/lib/pinyinMode';
import { trackEvent } from '@/lib/analytics';

/**
 * V3.4 — small, visible pinyin visibility control (show / hide / smart-auto).
 * Controlled component: parent owns the mode (usually via usePinyinMode).
 */
export default function PinyinToggle({
  mode,
  onChange,
  hskLevel,
  compact = false,
}: {
  mode: PinyinMode;
  onChange: (m: PinyinMode) => void;
  hskLevel?: 1 | 2 | 3;
  compact?: boolean;
}) {
  const opts: { key: PinyinMode; label: string; icon: typeof Eye }[] = [
    { key: 'show', label: 'إظهار البينين', icon: Eye },
    { key: 'hide', label: 'إخفاء البينين', icon: EyeOff },
    { key: 'auto', label: 'الوضع الذكي', icon: Sparkles },
  ];

  const pick = (m: PinyinMode) => {
    onChange(m);
    trackEvent('pinyin_toggle', { mode: m, hsk_level: hskLevel ?? 0 });
  };

  return (
    <div className="inline-flex gap-1 liquid-glass rounded-xl p-1" dir="rtl" role="group" aria-label="إظهار أو إخفاء البينين">
      {opts.map(o => {
        const Icon = o.icon;
        const active = mode === o.key;
        return (
          <button
            key={o.key}
            onClick={() => pick(o.key)}
            aria-pressed={active}
            title={o.label}
            className={`flex items-center gap-1 rounded-lg font-arabic font-semibold transition-colors ${compact ? 'text-[11px] px-2 py-1' : 'text-xs px-3 py-1.5'} ${active ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] hover:text-white'}`}
          >
            <Icon size={compact ? 12 : 13} />
            {!compact && <span>{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
