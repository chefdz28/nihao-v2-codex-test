import { useState, useEffect, useCallback } from 'react';
import { Gift, Copy, Check, Users, Share2 } from 'lucide-react';
import { getMyReferralCode, getMyReferralStats, type ReferralStats } from '@/lib/referral';
import { trackEvent } from '@/lib/analytics';

/** V3.15 — "invite a friend" card on the dashboard. Shows the user's referral
 *  link, a copy/share button, and how many friends they've invited. */
export default function ReferralCard() {
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ invited_count: 0, coins_from_referrals: 0 });
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [c, s] = await Promise.all([getMyReferralCode(), getMyReferralStats()]);
    setCode(c); setStats(s); setLoaded(true);
  }, []);

  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  if (!loaded || !code) return null;

  const link = `${window.location.origin}/register?ref=${code}`;
  const shareText = `تعلّم الصينية معي على NiHao! سجّل من رابطي وكلانا ياخذ ٥٠ عملة 🎁\n${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      trackEvent('referral_copy', {});
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const share = async () => {
    trackEvent('referral_share', {});
    if (navigator.share) {
      try { await navigator.share({ title: 'NiHao', text: shareText, url: link }); } catch { /* cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-5 mb-6" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-white text-sm flex items-center gap-1.5 font-arabic">
          <Gift size={16} className="text-[#FF3333]" /> ادعُ صديقاً
        </h2>
        {stats.invited_count > 0 && (
          <span className="flex items-center gap-1 text-xs font-display font-bold text-[#10b981]">
            <Users size={13} /> {stats.invited_count} {stats.invited_count === 1 ? 'صديق' : 'أصدقاء'}
          </span>
        )}
      </div>

      <p className="text-xs font-arabic mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        شارك رابطك — كل صديق يسجّل، تحصل أنت وهو على <span className="text-[#FF6666] font-bold">٥٠ عملة</span>.
      </p>

      {/* code + copy */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span className="font-display font-bold text-white text-sm" style={{ direction: 'ltr' }}>{code}</span>
          <button onClick={copy} aria-label="نسخ الرابط" className="text-[#FF6666] hover:text-[#FF3333] transition-colors">
            {copied ? <Check size={16} className="text-[#10b981]" /> : <Copy size={16} />}
          </button>
        </div>
        <button onClick={share} className="btn-primary text-sm py-2.5 px-4 font-arabic inline-flex items-center gap-1.5">
          <Share2 size={15} /> شارك
        </button>
      </div>

      {stats.coins_from_referrals > 0 && (
        <p className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>
          ربحت {stats.coins_from_referrals} عملة من الإحالات 🎉
        </p>
      )}
    </div>
  );
}
