import { useState } from 'react';
import { Share2, Link2, Check, MessageCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

/**
 * V3.0A — lightweight social sharing. Uses navigator.share when available,
 * otherwise WhatsApp / Facebook / X / copy-link via plain URLs. No third-party
 * SDKs, no heavy libraries. Sends a safe GA4 event (channel + path, no PII).
 */
export default function SocialShareButtons({ title, compact = false }: { title?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : 'NiHao');
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  const fire = (channel: string) => trackEvent('share', { method: channel, source_path: path });

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: shareTitle, url }); fire('native'); } catch { /* cancelled */ }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true); fire('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const enc = encodeURIComponent;
  const waUrl = `https://wa.me/?text=${enc(shareTitle + ' ' + url)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${enc(shareTitle)}&url=${enc(url)}`;

  const hasNative = typeof navigator !== 'undefined' && !!navigator.share;
  const btn = `inline-flex items-center justify-center gap-1.5 rounded-xl font-display font-semibold transition-colors ${compact ? 'text-xs py-2 px-3' : 'text-sm py-2.5 px-4'}`;

  return (
    <div className="flex flex-wrap items-center gap-2" dir="rtl">
      {!compact && (
        <span className="text-xs font-arabic flex items-center gap-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
          <Share2 size={14} className="text-[#FF3333]" /> شارك:
        </span>
      )}

      {hasNative && (
        <button onClick={nativeShare} className={`${btn} bg-[#FF3333] text-white hover:bg-[#ff5555]`} aria-label="مشاركة">
          <Share2 size={14} /> مشاركة
        </button>
      )}

      <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => fire('whatsapp')} className={`${btn} bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25`} aria-label="مشاركة على واتساب">
        <MessageCircle size={14} /> واتساب
      </a>

      <a href={fbUrl} target="_blank" rel="noopener noreferrer" onClick={() => fire('facebook')} className={`${btn} bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25`} aria-label="مشاركة على فيسبوك">
        Facebook
      </a>

      <a href={xUrl} target="_blank" rel="noopener noreferrer" onClick={() => fire('x')} className={`${btn} bg-white/5 text-white hover:bg-white/10`} aria-label="مشاركة على X">
        X
      </a>

      <button onClick={copyLink} className={`${btn} bg-white/5 text-white hover:bg-white/10`} aria-label="نسخ الرابط">
        {copied ? <><Check size={14} className="text-[#10b981]" /> تم النسخ</> : <><Link2 size={14} /> نسخ الرابط</>}
      </button>
    </div>
  );
}
