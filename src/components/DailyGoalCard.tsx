import { useState, useMemo } from 'react';
import { Target, Check } from 'lucide-react';
import { getXP } from '@/lib/gamification';

// Daily XP goal. Stored locally: a baseline (XP total at the start of today) so
// we can show how much was earned TODAY without any new table.
const GOAL_KEY = 'nihao:daily-goal';
const BASE_KEY = 'nihao:daily-xp-base';
const DEFAULT_GOAL = 30;

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

function loadGoal(): number {
  try { return Number(window.localStorage.getItem(GOAL_KEY)) || DEFAULT_GOAL; } catch { return DEFAULT_GOAL; }
}
function saveGoal(g: number): void {
  try { window.localStorage.setItem(GOAL_KEY, String(g)); } catch { /* private */ }
}

// Earned-today = current total XP minus the total captured at the first visit today.
function earnedToday(): number {
  try {
    const raw = window.localStorage.getItem(BASE_KEY);
    const total = getXP();
    let base = raw ? JSON.parse(raw) : null;
    if (!base || base.date !== todayStr()) {
      base = { date: todayStr(), total };
      window.localStorage.setItem(BASE_KEY, JSON.stringify(base));
    }
    return Math.max(0, total - base.total);
  } catch {
    return 0;
  }
}

/**
 * V3.6 — daily XP goal ring. Encourages a daily-return habit. 100% local (no new
 * table); reuses the existing XP system. Lightweight SVG ring, no new deps.
 */
export default function DailyGoalCard() {
  const [goal, setGoal] = useState<number>(() => loadGoal());
  const earned = useMemo(() => earnedToday(), []);
  const pct = Math.min(100, Math.round((earned / goal) * 100));
  const done = earned >= goal;

  const cycleGoal = () => {
    const options = [20, 30, 50, 80];
    const next = options[(options.indexOf(goal) + 1) % options.length] ?? DEFAULT_GOAL;
    setGoal(next);
    saveGoal(next);
  };

  // ring geometry
  const r = 26, c = 2 * Math.PI * r, off = c - (pct / 100) * c;

  return (
    <div className="liquid-glass rounded-2xl p-4 flex items-center gap-4" dir="rtl">
      <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={done ? '#10b981' : '#FF3333'} strokeWidth="5"
            strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {done ? <Check size={22} className="text-[#10b981]" /> : <span className="text-sm font-black text-white">{pct}%</span>}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Target size={14} className="text-[#FF3333]" />
          <h3 className="font-display font-bold text-white text-sm font-arabic">هدف اليوم</h3>
        </div>
        <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
          {done ? 'أنجزت هدف اليوم! أحسنت 🎉' : `${earned} / ${goal} نقطة خبرة اليوم`}
        </p>
      </div>
      <button onClick={cycleGoal} className="text-[11px] font-arabic px-2.5 py-1 rounded-lg bg-white/5 text-[#a0a0a0] hover:text-white shrink-0">
        تغيير الهدف
      </button>
    </div>
  );
}
