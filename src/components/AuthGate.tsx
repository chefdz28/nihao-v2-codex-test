import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, UserCircle2, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { trackEvent } from '@/lib/analytics';

/**
 * V3.4 — friendly login gate shown when a guest tries to start/submit a serious
 * test. Does NOT redirect on page load (the learner still sees the intro/SEO
 * content); it only appears when a gated action is triggered. Optionally allows
 * "continue as guest" for preview-only flows.
 *
 * Fires auth_gate_view once on mount + test_login_required (no PII).
 */
export default function AuthGate({
  onClose,
  onGuest,
  context = 'test',
  guestLabel,
}: {
  onClose: () => void;
  onGuest?: () => void;        // if provided, shows a "continue as guest" option
  context?: string;            // e.g. 'hsk3_sim' (for analytics, non-PII)
  guestLabel?: string;
}) {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const isAr = lang === 'ar';

  useEffect(() => {
    trackEvent('auth_gate_view', { context });
    trackEvent('test_login_required', { context });
  }, [context]);

  const goLogin = () => {
    // remember intended route so the user returns here after login
    navigate('/login', { state: { from: location.pathname } });
  };
  const goRegister = () => {
    navigate('/register', { state: { from: location.pathname } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      <div className="liquid-glass-strong rounded-2xl max-w-[420px] w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-[#a0a0a0] hover:text-white" aria-label={isAr ? 'إغلاق' : 'Close'}>
          <X size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-[#FF3333]/15 flex items-center justify-center mx-auto mb-3">
            <Lock size={22} className="text-[#FF3333]" />
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-1">
            {isAr ? 'سجّل مجاناً لحفظ نتيجتك' : 'Sign in to save your result'}
          </h2>
          <p className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
            {isAr
              ? 'سجّل الدخول مجاناً لحفظ نتيجتك وتتبّع تقدّمك وكسب نقاط الخبرة.'
              : 'Sign in for free to save your result, track progress, and earn XP.'}
          </p>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton />

          <button
            onClick={goLogin}
            className="w-full h-[48px] rounded-xl bg-white/[0.04] border border-white/10 text-white font-display font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-colors font-arabic"
          >
            <Mail size={16} /> {isAr ? 'الدخول بالبريد الإلكتروني' : 'Login with Email'}
          </button>

          <button onClick={goRegister} className="w-full text-center text-xs font-arabic text-[#a0a0a0] hover:text-white">
            {isAr ? 'ليس لديك حساب؟ أنشئ حساباً مجانياً' : "Don't have an account? Sign up free"}
          </button>

          {onGuest && (
            <button
              onClick={onGuest}
              className="w-full h-[44px] rounded-xl text-[#a0a0a0] hover:text-white flex items-center justify-center gap-2 font-arabic text-sm"
            >
              <UserCircle2 size={15} /> {guestLabel || (isAr ? 'المتابعة كضيف (بدون حفظ)' : 'Continue as guest (no saving)')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
