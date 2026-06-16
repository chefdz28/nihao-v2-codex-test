import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Check, Loader2 } from 'lucide-react';
import { subscribeEmail } from '@/lib/emailLeads';
import { trackEvent } from '@/lib/analytics';

/**
 * V3.0A — lightweight email capture ("word of the day" newsletter). Stores only
 * the email + source context in Supabase (consent required). Sends a GA4 event
 * on success WITHOUT the email (no PII).
 */
export default function LeadCaptureBox({ sourceType = 'inline', compact = false }: { sourceType?: string; compact?: boolean }) {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error' | 'invalid' | 'duplicate'>('idle');

  const submit = async () => {
    if (!consent) return;
    setState('loading');
    const res = await subscribeEmail(email, sourceType, location.pathname);
    if (res.ok) {
      setState('done');
      // safe event — NO email, just where it happened
      trackEvent('newsletter_signup', { source_type: sourceType, source_path: location.pathname });
    } else {
      setState(res.reason === 'invalid' ? 'invalid' : res.reason === 'duplicate' ? 'duplicate' : 'error');
    }
  };

  if (state === 'done' || state === 'duplicate') {
    return (
      <div className={`liquid-glass rounded-2xl ${compact ? 'p-4' : 'p-6'} text-center`} dir="rtl">
        <Check className="text-[#10b981] mx-auto mb-2" size={compact ? 22 : 28} />
        <p className="font-arabic text-white text-sm">
          {state === 'duplicate' ? 'أنت مشترك بالفعل — شكراً لك!' : 'تم الاشتراك! ترقّب كلمة اليوم في بريدك.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`liquid-glass rounded-2xl ${compact ? 'p-4' : 'p-6'}`} dir="rtl">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={compact ? 16 : 18} className="text-[#FF3333]" />
        <h3 className={`font-display font-bold text-white font-arabic ${compact ? 'text-base' : 'text-lg'}`}>كلمة كل يوم في بريدك</h3>
      </div>
      <p className="text-xs font-arabic mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        اشترك لتصلك كلمة صينية جديدة ونصائح تعلّم — بدون إزعاج.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          inputMode="email"
          dir="ltr"
          value={email}
          onChange={e => { setEmail(e.target.value); if (state !== 'idle') setState('idle'); }}
          placeholder="your@email.com"
          aria-label="البريد الإلكتروني"
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FF3333]/40"
        />
        <button
          onClick={submit}
          disabled={state === 'loading' || !consent || !email}
          className="btn-primary text-sm py-2.5 px-5 font-arabic disabled:opacity-50 shrink-0 inline-flex items-center justify-center gap-1.5"
        >
          {state === 'loading' ? <><Loader2 size={14} className="animate-spin" /> جارٍ…</> : 'اشترك'}
        </button>
      </div>

      <label className="flex items-start gap-2 mt-3 cursor-pointer">
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 accent-[#FF3333]" aria-label="الموافقة على استلام البريد" />
        <span className="text-[11px] font-arabic leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
          أوافق على استلام رسائل بريدية من NiHao. يمكن إلغاء الاشتراك في أي وقت.
        </span>
      </label>

      {state === 'invalid' && <p className="text-[11px] text-[#FF3333] font-arabic mt-2">يرجى إدخال بريد إلكتروني صحيح.</p>}
      {state === 'error' && <p className="text-[11px] text-[#FF3333] font-arabic mt-2">حدث خطأ، حاول مرة أخرى.</p>}
    </div>
  );
}
