// V2.0.5 SRS — lightweight spaced repetition stored in localStorage.
// "I know it" grows the interval (1 → 3 → 7 → 14 → 30 days);
// "Review again" resets the card to due tomorrow.
// All storage access is wrapped in try/catch (private mode safe);
// when storage is unavailable, everything degrades to the old behavior.

export interface SrsCard {
  due: string;       // ISO date (yyyy-mm-dd) when the card is due
  step: number;      // index into INTERVALS
}

const INTERVALS = [1, 3, 7, 14, 30]; // days
const KEY = 'nihao_srs_v1';

type SrsStore = Record<string, SrsCard>; // cardId -> card

function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function load(): SrsStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SrsStore) : {};
  } catch {
    return {};
  }
}

function save(store: SrsStore): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage unavailable — silently keep session-only behavior
  }
}

/** namespaced id so the same vocab id can exist in several decks */
export function srsId(deck: string, cardId: string): string {
  return `${deck}:${cardId}`;
}

/** card ids that are due today (or never studied) from the given list */
export function dueCards(deck: string, cardIds: string[]): { due: string[]; learned: number } {
  const store = load();
  const today = todayStr();
  const due: string[] = [];
  let learned = 0;
  for (const id of cardIds) {
    const rec = store[srsId(deck, id)];
    if (!rec) { due.push(id); continue; }
    learned++;
    if (rec.due <= today) due.push(id);
  }
  return { due, learned };
}

/** record an answer; returns the next due date label (days) */
export function recordAnswer(deck: string, cardId: string, known: boolean): number {
  const store = load();
  const id = srsId(deck, cardId);
  const prev = store[id];
  let step: number;
  if (known) {
    step = prev ? Math.min(prev.step + 1, INTERVALS.length - 1) : 0;
  } else {
    step = 0;
  }
  const days = known ? INTERVALS[step] : 1;
  store[id] = { due: todayStr(days), step };
  save(store);
  return days;
}
