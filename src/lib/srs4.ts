// V3.3 — lightweight 4-button SRS (Again/Hard/Good/Easy) stored in localStorage.
// Independent of the existing binary srs.ts so nothing existing changes. One
// store per deck key (e.g. 'hsk3'). No database, no PII.
export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface Srs4Card {
  ease: number;       // ease factor (~1.3..3.0)
  interval: number;   // days until next due
  due: string;        // yyyy-mm-dd
  reps: number;       // total reviews
}

type Store = Record<string, Srs4Card>;

function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function keyFor(deck: string): string { return `nihao_srs4_${deck}`; }

function load(deck: string): Store {
  try { return JSON.parse(window.localStorage.getItem(keyFor(deck)) || '{}'); } catch { return {}; }
}
function save(deck: string, store: Store): void {
  try { window.localStorage.setItem(keyFor(deck), JSON.stringify(store)); } catch { /* private mode */ }
}

/** Cards due today (or new). Returns due ids + counts. */
export function due4(deck: string, cardIds: string[]): { due: string[]; learned: number; total: number } {
  const store = load(deck);
  const today = todayStr();
  const due = cardIds.filter(id => {
    const c = store[id];
    return !c || c.due <= today;
  });
  const learned = cardIds.filter(id => store[id] && store[id].reps > 0).length;
  return { due, learned, total: cardIds.length };
}

/** Apply a rating to a card and persist. Returns the next interval (days). */
export function rate4(deck: string, cardId: string, rating: SrsRating): number {
  const store = load(deck);
  const prev: Srs4Card = store[cardId] || { ease: 2.5, interval: 0, due: todayStr(), reps: 0 };
  let { ease, interval } = prev;

  switch (rating) {
    case 'again':
      ease = Math.max(1.3, ease - 0.2);
      interval = 0; // see again today
      break;
    case 'hard':
      ease = Math.max(1.3, ease - 0.15);
      interval = interval <= 1 ? 1 : Math.round(interval * 1.2);
      break;
    case 'good':
      interval = interval === 0 ? 1 : interval === 1 ? 3 : Math.round(interval * ease);
      break;
    case 'easy':
      ease = ease + 0.15;
      interval = interval === 0 ? 2 : Math.round(interval * ease * 1.3);
      break;
  }
  interval = Math.min(interval, 365);

  store[cardId] = {
    ease,
    interval,
    due: todayStr(interval),
    reps: prev.reps + 1,
  };
  save(deck, store);
  return interval;
}

/** Summary for a deck (for progress display). */
export function deckSummary(deck: string, cardIds: string[]): { learned: number; due: number; total: number } {
  const { due, learned, total } = due4(deck, cardIds);
  return { learned, due: due.length, total };
}
