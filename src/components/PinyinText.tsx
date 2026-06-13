import type { ReactNode, CSSProperties } from 'react';

interface PinyinTextProps {
  children: ReactNode;
  /** sm (default, lists/answers) | base (cards/examples) | lg (hero/feature) */
  size?: 'sm' | 'base' | 'lg';
  /** render inline-block instead of block (for inline result lines) */
  inline?: boolean;
  /** softer red for secondary contexts (e.g. struck-through wrong forms) */
  muted?: boolean;
  className?: string;
}

const SIZE: Record<NonNullable<PinyinTextProps['size']>, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

// unicode-bidi isolation + LTR so Arabic RTL layout can never reorder,
// shrink or clip pinyin tone marks.
const STYLE: CSSProperties = { unicodeBidi: 'isolate' };

/**
 * V2.0.6 PinyinText — the single way to render pinyin everywhere.
 * Always LTR + bidi-isolated (RTL-proof), readable size (>= text-sm),
 * relaxed line-height so tone marks are never clipped, accent red color.
 */
export default function PinyinText({ children, size = 'sm', inline = false, muted = false, className = '' }: PinyinTextProps) {
  if (children === null || children === undefined || children === '') return null;
  return (
    <span
      lang="zh-Latn"
      dir="ltr"
      style={STYLE}
      className={[
        inline ? 'inline-block' : 'block',
        'font-sans leading-relaxed tracking-normal whitespace-normal text-left',
        muted ? 'text-[#FF3333]/70' : 'text-[#FF4444]',
        'font-semibold',
        SIZE[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
