import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { useI18n } from '@/i18n';

interface StartHereProps {
  /** route to lesson 1, when known (e.g. /courses/<levelId>/<lessonId>) */
  lesson1Path?: string;
  compact?: boolean;
}

/**
 * V2.1 "Start Here" — the pinyin-first beginner flow, shown on Home, Courses,
 * Practice and the Dashboard (when there is no progress). Beginners must
 * learn to READ sounds (pinyin + tones) before memorizing characters.
 */
export default function StartHere({ lesson1Path = '/courses', compact = false }: StartHereProps) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  const steps = [
    { n: 1, path: '/pinyin', label: t('start.step1'), emoji: '🔤' },
    { n: 2, path: '/tones', label: t('start.step2'), emoji: '🎵' },
    { n: 3, path: '/essentials', label: t('start.step3'), emoji: '🔢' },
    { n: 4, path: lesson1Path, label: t('start.step4'), emoji: '🎓' },
    { n: 5, path: '/path', label: t('start.step5'), emoji: '🗺️' },
  ];

  return (
    <div className="liquid-glass p-6 rounded-2xl border border-[#FF3333]/20 bg-gradient-to-br from-[#FF3333]/10 to-transparent">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#FF3333] flex items-center justify-center shrink-0">
          <Rocket size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-white">{t('start.title')}</h3>
          {!compact && (
            <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-secondary)' }}>
              {t('start.subtitle')}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <p className={`text-sm mb-4 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('start.why')}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
        {steps.map(s => (
          <Link key={s.n} to={s.path}
            className="rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#FF3333]/40 p-3 text-center transition-colors">
            <span className="text-2xl block mb-1">{s.emoji}</span>
            <span className="text-[11px] font-display font-semibold text-white block leading-tight">{s.n}. {s.label}</span>
          </Link>
        ))}
      </div>

      <Link to="/pinyin" className="btn-primary text-sm py-2.5 px-6 inline-flex">
        {t('start.cta')}
      </Link>
    </div>
  );
}
