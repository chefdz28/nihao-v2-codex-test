// V2.1 gamification core — XP ledger, daily missions, badges, placement result.
// 100% localStorage (try/catch safe, no SQL). Anti-duplicate XP via action ids.

const K = {
  xp: 'nihao_xp_v1',          // { total: number, actions: string[] (last 500) }
  missions: 'nihao_missions_v1', // { date: 'yyyy-mm-dd', progress: Record<missionId, number>, claimed: string[] }
  badges: 'nihao_badges_v1',   // string[] unlocked badge ids
  stats: 'nihao_stats_v1',     // counters: Record<string, number>
  placement: 'nihao_placement_v1', // { date, score, recommendation }
  plan: 'nihao_plan_v1',       // { date, done: string[] }
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function save(key: string, value: unknown): void {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}
export function todayStr(): string { return new Date().toISOString().slice(0, 10); }

// ---------------- XP ----------------
export const XP_REWARDS = {
  lesson_complete: 20,
  quiz_finish: 10,
  quiz_perfect_bonus: 15,
  flashcard_review: 5,
  mission_complete: 25,
  tone_round: 10,
  number_round: 10,
  dialogue_round: 15,
  pinyin_practice: 10,
  plan_task: 10,
} as const;

interface XpState { total: number; actions: string[] }

export function getXP(): number { return load<XpState>(K.xp, { total: 0, actions: [] }).total; }

/** Award XP once per unique actionId (e.g. 'lesson_complete:<lessonId>'). Returns awarded amount (0 if duplicate). */
export function awardXP(actionId: string, amount: number): number {
  const st = load<XpState>(K.xp, { total: 0, actions: [] });
  if (st.actions.includes(actionId)) return 0;
  st.total += amount;
  st.actions = [...st.actions.slice(-499), actionId];
  save(K.xp, st);
  return amount;
}

/** daily-scoped action (resets each day): tone rounds, flashcard sessions... */
export function awardDailyXP(action: string, amount: number): number {
  return awardXP(`${todayStr()}:${action}`, amount);
}

// ---------------- Stats counters (feed missions + badges) ----------------
export function bumpStat(name: string, by = 1): number {
  const st = load<Record<string, number>>(K.stats, {});
  st[name] = (st[name] || 0) + by;
  save(K.stats, st);
  return st[name];
}
export function getStats(): Record<string, number> { return load(K.stats, {}); }

// ---------------- Daily missions ----------------
export interface MissionDef {
  id: string;
  icon: string;
  target: number;
  stat: string;             // daily stat counter name
  xp: number;
  labelKey: string;         // i18n
  link: string;
  beginnerOnly?: boolean;
}
export const MISSIONS: MissionDef[] = [
  { id: 'words5', icon: '📖', target: 5, stat: 'words_seen', xp: 25, labelKey: 'missions.words5', link: '/dictionary' },
  { id: 'cards10', icon: '🃏', target: 10, stat: 'cards_reviewed', xp: 25, labelKey: 'missions.cards10', link: '/flashcards' },
  { id: 'lesson1', icon: '🎓', target: 1, stat: 'lessons_done', xp: 25, labelKey: 'missions.lesson1', link: '/courses' },
  { id: 'tones1', icon: '🎵', target: 1, stat: 'tone_rounds', xp: 25, labelKey: 'missions.tones1', link: '/tones' },
  { id: 'numbers1', icon: '🔢', target: 1, stat: 'number_rounds', xp: 25, labelKey: 'missions.numbers1', link: '/numbers' },
  { id: 'dialogue1', icon: '💬', target: 1, stat: 'dialogue_rounds', xp: 25, labelKey: 'missions.dialogue1', link: '/dialogues' },
  { id: 'write3', icon: '✍️', target: 3, stat: 'chars_written', xp: 25, labelKey: 'missions.write3', link: '/practice' },
  { id: 'pinyin5', icon: '🔤', target: 1, stat: 'pinyin_sessions', xp: 25, labelKey: 'missions.pinyin5', link: '/pinyin', beginnerOnly: true },
];

interface MissionState { date: string; progress: Record<string, number>; claimed: string[] }

function missionState(): MissionState {
  const st = load<MissionState>(K.missions, { date: todayStr(), progress: {}, claimed: [] });
  if (st.date !== todayStr()) return { date: todayStr(), progress: {}, claimed: [] }; // daily reset
  return st;
}

/** bump today's mission progress for a stat (also bumps lifetime stat) */
export function trackActivity(stat: string, by = 1): void {
  bumpStat(stat, by);
  const st = missionState();
  st.progress[stat] = (st.progress[stat] || 0) + by;
  save(K.missions, st);
}

export function getMissions(isBeginner: boolean) {
  const st = missionState();
  return MISSIONS.filter(m => !m.beginnerOnly || isBeginner).map(m => {
    const cur = Math.min(st.progress[m.stat] || 0, m.target);
    const complete = cur >= m.target;
    const claimed = st.claimed.includes(m.id);
    return { ...m, current: cur, complete, claimed };
  });
}

export function claimMission(id: string): number {
  const st = missionState();
  const def = MISSIONS.find(m => m.id === id);
  if (!def || st.claimed.includes(id)) return 0;
  if ((st.progress[def.stat] || 0) < def.target) return 0;
  st.claimed = [...st.claimed, id];
  save(K.missions, st);
  return awardXP(`mission:${todayStr()}:${id}`, def.xp);
}

// ---------------- Today's plan ----------------
export function getPlanDone(): string[] {
  const st = load<{ date: string; done: string[] }>(K.plan, { date: todayStr(), done: [] });
  return st.date === todayStr() ? st.done : [];
}
export function markPlanDone(taskId: string): number {
  const done = getPlanDone();
  if (done.includes(taskId)) return 0;
  save(K.plan, { date: todayStr(), done: [...done, taskId] });
  return awardXP(`plan:${todayStr()}:${taskId}`, XP_REWARDS.plan_task);
}

// ---------------- Badges ----------------
export interface BadgeDef {
  id: string; icon: string; labelKey: string; descKey: string;
  /** returns true when unlocked, given lifetime stats + external info */
  check: (s: Record<string, number>, extra: { completedLessons: number; streak: number; xp: number }) => boolean;
}
export const BADGES: BadgeDef[] = [
  { id: 'first_lesson', icon: '🎯', labelKey: 'badges.firstLesson', descKey: 'badges.firstLesson.d', check: (s, e) => e.completedLessons >= 1 || (s.lessons_done || 0) >= 1 },
  { id: 'pinyin_beginner', icon: '🔤', labelKey: 'badges.pinyinBeginner', descKey: 'badges.pinyinBeginner.d', check: s => (s.pinyin_sessions || 0) >= 1 },
  { id: 'tone_starter', icon: '🎵', labelKey: 'badges.toneStarter', descKey: 'badges.toneStarter.d', check: s => (s.tone_rounds || 0) >= 1 },
  { id: 'tone_master1', icon: '🎼', labelKey: 'badges.toneMaster1', descKey: 'badges.toneMaster1.d', check: s => (s.tone_perfect || 0) >= 1 },
  { id: 'words50', icon: '📖', labelKey: 'badges.words50', descKey: 'badges.words50.d', check: s => (s.words_seen || 0) >= 50 },
  { id: 'words100', icon: '📚', labelKey: 'badges.words100', descKey: 'badges.words100.d', check: s => (s.words_seen || 0) >= 100 },
  { id: 'streak7', icon: '🔥', labelKey: 'badges.streak7', descKey: 'badges.streak7.d', check: (_s, e) => e.streak >= 7 },
  { id: 'grammar_starter', icon: '📐', labelKey: 'badges.grammarStarter', descKey: 'badges.grammarStarter.d', check: s => (s.grammar_done || 0) >= 1 },
  { id: 'hanzi_writer', icon: '✍️', labelKey: 'badges.hanziWriter', descKey: 'badges.hanziWriter.d', check: s => (s.chars_written || 0) >= 10 },
  { id: 'dialogue_beginner', icon: '💬', labelKey: 'badges.dialogueBeginner', descKey: 'badges.dialogueBeginner.d', check: s => (s.dialogue_rounds || 0) >= 1 },
  { id: 'numbers_master', icon: '🔢', labelKey: 'badges.numbersMaster', descKey: 'badges.numbersMaster.d', check: s => (s.number_correct || 0) >= 50 },
  { id: 'hsk1_explorer', icon: '🧭', labelKey: 'badges.hsk1Explorer', descKey: 'badges.hsk1Explorer.d', check: (_s, e) => e.completedLessons >= 10 },
];

export function getBadges(extra: { completedLessons: number; streak: number; xp: number }) {
  const stats = getStats();
  const unlockedBefore = load<string[]>(K.badges, []);
  const result = BADGES.map(b => ({ ...b, unlocked: unlockedBefore.includes(b.id) || b.check(stats, extra) }));
  const nowUnlocked = result.filter(b => b.unlocked).map(b => b.id);
  if (nowUnlocked.length !== unlockedBefore.length) save(K.badges, nowUnlocked);
  return result;
}

// ---------------- Placement test ----------------
export interface PlacementResult { date: string; score: number; total: number; recommendation: string }
export function getPlacement(): PlacementResult | null { return load<PlacementResult | null>(K.placement, null); }
export function savePlacement(r: PlacementResult): void { save(K.placement, r); }
