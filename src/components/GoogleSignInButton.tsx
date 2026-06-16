import { useState } from 'react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/lib/analytics';

/**
 * V3.4 — "Continue with Google" button. Uses Supabase OAuth via the auth
 * context (no Google SDK, no secrets in the frontend). Shows loading + error.
 */
export default function GoogleSignInButton({ className = '' }: { className?: string }) {
  const { lang } = useI18n();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAr = lang === 'ar';

  const handleClick = async () => {
    setError('');
    setLoading(true);
    trackEvent('google_login_click', {});
    try {
      await signInWithGoogle();
      // Supabase redirects the browser to Google; nothing else to do here.
    } catch {
      setLoading(false);
      setError(isAr ? 'تعذّر تسجيل الدخول عبر Google. حاول مرة أخرى.' : 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full h-[52px] rounded-xl bg-white text-[#1f1f1f] font-display font-semibold flex items-center justify-center gap-3 hover:bg-white/90 transition-colors disabled:opacity-60"
        aria-label={isAr ? 'تسجيل الدخول بواسطة Google' : 'Continue with Google'}
      >
        {/* Google "G" logo (inline SVG, no external asset) */}
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
        {loading
          ? (isAr ? 'جارٍ التحويل…' : 'Redirecting…')
          : (isAr ? 'تسجيل الدخول بواسطة Google' : 'Continue with Google')}
      </button>
      {error && <p className="text-[#FF3333] text-xs mt-2 text-center font-arabic">{error}</p>}
    </div>
  );
}
