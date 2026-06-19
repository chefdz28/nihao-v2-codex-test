import { useEffect, useState } from 'react';
import { Flame, TrendingUp, BookA, Award } from 'lucide-react';
import { getProgress, type ProgressRow } from '@/lib/studentProgress';
import { computeStreak } from '@/lib/learning';

// Arabic weekday letters (Sun..Sat) — matches getDay() 0..6
const WEEKDAY_AR = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

function dayKey(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

// rough active-vocabulary estimate: completed lessons/daily/quizzes each surface
// a handful of words. Deterministic, no AI — just a motivating count.
const WORDS_PER = { lesson: 8, daily: 5, quiz: 6, story: 4, dialogue: 4 } as const;

interface LevelTier { key: string; label: string; need: number; }
const TIERS: LevelTier[] = [
  { key: 'start', label: 'مبتدئ', need: 0 },
  { key: 'a1a', label: 'A1 — أساسيات', need: 40 },
  { key: 'a1b', label: 'A1 — متقدّم', need: 90 },
  { key: 'hsk1', label: 'HSK1 جاهز', need: 150 },
];

/** V3.14 — visual student progress: weekly streak, active vocab, 14-day activity,
 *  and a simple A1/HSK1 level estimate. All from existing student_progress data. */
export default function StudentProgressDashboard() {
  const [rows, setRows] = useState<ProgressRow[] | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const data = await getProgress();
      if (active) setRows(data.filter(r => r.status === 'completed'));
    })();
    return () => { active = false; };
  }, []);

  if (!rows) return null;          // loading: stay quiet
  if (rows.length === 0) return null; // nothing yet: don't clutter a new user's dashboard

  const timestamps = rows.map(r => r.completed_at).filter(Boolean) as string[];
  const streak = computeStreak(timestamps);

  // set of active days for the last 7 days (for the weekly bar)
  const activeDays = new Set(timestamps.map(t => t.slice(0, 10)));
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = dayKey(6 - i); // oldest → newest (left→right in RTL handled by layout)
    const d = new Date(key + 'T00:00:00');
    return { key, weekday: WEEKDAY_AR[d.getDay()], done: activeDays.has(key) };
  });

  // 14-day activity counts (how many items completed each day)
  const counts: Record<string, number> = {};
  timestamps.forEach(t => { const k = t.slice(0, 10); counts[k] = (counts[k] || 0) + 1; });
  const last14 = Array.from({ length: 14 }, (_, i) => counts[dayKey(13 - i)] || 0);
  const maxCount = Math.max(1, ...last14);

  // active vocabulary estimate
  const byType = (t: string) => rows.filter(r => r.content_type === t).length;
  const vocab =
    byType('lesson') * WORDS_PER.lesson +
    byType('daily') * WORDS_PER.daily +
    byType('quiz') * WORDS_PER.quiz +
    byType('story') * WORDS_PER.story +
    byType('dialogue') * WORDS_PER.dialogue;

  // level estimate
  let tierIdx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) { if (vocab >= TIERS[i].need) { tierIdx = i; break; } }
  const tier = TIERS[tierIdx];
  const nextTier = TIERS[tierIdx + 1];
  const levelPct = nextTier
    ? Math.min(100, Math.round(((vocab - tier.need) / (nextTier.need - tier.need)) * 100))
    : 100;

  return (
    <div className="liquid-glass rounded-2xl p-5 mb-6" dir="rtl">
      <h2 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-1.5 font-arabic">
        <TrendingUp size={16} className="text-[#FF3333]" /> تقدّمك
      </h2>

      {/* weekly streak bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>هذا الأسبوع</span>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs font-display font-bold text-[#FF6666]">
              <Flame size={13} /> {streak} {streak === 1 ? 'يوم' : 'أيام'} متتالية
            </span>
          )}
        </div>
        <div className="flex justify-between gap-1">
          {week.map(d => (
            <div key={d.key} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-full aspect-square max-w-[38px] rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${d.done ? 'bg-[#FF3333] text-white' : 'bg-white/[0.04] text-[#555]'}`}>
                {d.done ? '✓' : ''}
              </div>
              <span className="text-[9px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>{d.weekday}</span>
            </div>
          ))}
        </div>
      </div>

      {/* active vocab + level */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/[0.03] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BookA size={14} className="text-[#FF3333]" />
            <span className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>مفردات نشطة</span>
          </div>
          <p className="font-display font-black text-2xl text-white">~{vocab}</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Award size={14} className="text-[#FFD700]" />
            <span className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>مستواك التقديري</span>
          </div>
          <p className="font-display font-bold text-sm text-white mb-1.5">{tier.label}</p>
          {nextTier && (
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full bg-[#FFD700] rounded-full transition-all" style={{ width: `${levelPct}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* 14-day activity chart */}
      <div>
        <span className="text-xs font-arabic block mb-2" style={{ color: 'var(--color-text-secondary)' }}>نشاطك آخر ١٤ يوم</span>
        <div className="flex items-end justify-between gap-[3px] h-16">
          {last14.map((c, i) => (
            <div key={i} className="flex-1 rounded-t bg-[#FF3333]/70 transition-all" style={{ height: `${Math.max(6, (c / maxCount) * 100)}%`, opacity: c === 0 ? 0.15 : 1 }} title={`${c}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
