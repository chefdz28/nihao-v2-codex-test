import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpenText, MessagesSquare, GraduationCap, Zap, Flame, BookA, Sparkles, ArrowLeft } from 'lucide-react';
import { getSummary, getRecentActivity, type ProgressSummary, type ProgressRow } from '@/lib/studentProgress';

const TYPE_AR: Record<string, string> = {
  lesson: 'درس', story: 'قصة', dialogue: 'حوار', quiz: 'اختبار', daily: 'تدريب يومي',
};
const TYPE_PATH: Record<string, string> = {
  lesson: '/courses', story: '/stories', dialogue: '/dialogues', quiz: '/stories', daily: '/daily',
};

/** V2.9B — learning-progress panel shown at the top of the dashboard. */
export default function ProgressPanel() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [recent, setRecent] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [s, r] = await Promise.all([getSummary(), getRecentActivity(6)]);
      if (!active) return;
      setSummary(s); setRecent(r); setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  if (loading || !summary) return null;

  const empty = summary.total === 0;

  // suggested next step — simplest useful nudge
  const suggestion = summary.dialogues === 0
    ? { label: 'جرّب أول حوار', path: '/dialogues/airport-arrival' }
    : summary.stories === 0
      ? { label: 'اقرأ أول قصة', path: '/stories' }
      : { label: 'تدريب اليوم', path: '/daily' };

  const cards = [
    { label: 'دروس', value: summary.lessons, icon: GraduationCap, path: '/courses' },
    { label: 'قصص', value: summary.stories, icon: BookOpenText, path: '/stories' },
    { label: 'حوارات', value: summary.dialogues, icon: MessagesSquare, path: '/dialogues' },
    { label: 'تدريب يومي', value: summary.daily, icon: Flame, path: '/daily' },
  ];

  return (
    <div className="mb-8" dir="rtl">
      {/* XP + continue */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="liquid-glass rounded-2xl px-5 py-3 flex items-center gap-2">
          <Zap size={18} className="text-[#f59e0b]" />
          <span className="font-display font-black text-xl text-white">{summary.xp}</span>
          <span className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>نقطة خبرة</span>
        </div>
        <Link to={suggestion.path} className="btn-primary text-sm py-3 px-5 inline-flex items-center gap-2 font-arabic">
          <Sparkles size={15} /> {empty ? 'ابدأ التعلّم' : 'تابع التعلّم'}: {suggestion.label}
        </Link>
      </div>

      {empty ? (
        <div className="liquid-glass rounded-2xl p-8 text-center">
          <BookA size={32} className="text-[#FF3333] mx-auto mb-3" />
          <p className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
            ابدأ أول درس أو حوار ليظهر تقدمك هنا.
          </p>
        </div>
      ) : (
        <>
          {/* counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {cards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={c.path} className="liquid-glass rounded-2xl p-4 block hover:border-[#FF3333]/30 border border-transparent transition-colors">
                  <c.icon size={18} className="text-[#FF3333] mb-2" />
                  <div className="font-display font-black text-2xl text-white">{c.value}</div>
                  <div className="text-xs font-arabic mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{c.label} مكتملة</div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* recent activity */}
          {recent.length > 0 && (
            <div className="liquid-glass rounded-2xl p-5">
              <p className="text-xs font-display font-semibold uppercase mb-3 font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>آخر نشاط</p>
              <div className="flex flex-col gap-2">
                {recent.map((r, i) => (
                  <Link key={i} to={TYPE_PATH[r.content_type] || '/'} className="flex items-center justify-between text-sm hover:bg-white/[0.03] rounded-lg px-2 py-1.5 transition-colors">
                    <span className="font-arabic text-white flex items-center gap-2">
                      <ArrowLeft size={13} className="text-[#FF3333]" />
                      {TYPE_AR[r.content_type] || r.content_type}: {r.content_slug}
                    </span>
                    {r.completed_at && (
                      <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }} dir="ltr">{r.completed_at.slice(0, 10)}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
