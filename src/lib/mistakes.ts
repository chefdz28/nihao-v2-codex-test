// V2.2.1 Automatic Mistake Notebook — wrong answers collected locally from
// quizzes, placement test, grammar exercises, story quizzes and the HSK1
// simulation. localStorage only (key: nihao_mistakes), private-mode safe.

export type MistakeSource = 'story' | 'placement' | 'grammar' | 'quiz' | 'hsk1';

export interface Mistake {
  id: string;             // stable hash of source+question
  source: MistakeSource;
  question: string;       // the question text (AR or EN as shown)
  chinese?: string;
  pinyin?: string;
  yourAnswer: string;
  correctAnswer: string;
  explain_ar?: string;
  explain_en?: string;
  link: string;           // related lesson/story/tool route
  date: string;           // first occurrence (yyyy-mm-dd)
  reviewCount: number;
  mastered: boolean;
}

const KEY = 'nihao_mistakes';

function load(): Mistake[] {
  try { return JSON.parse(window.localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(list: Mistake[]): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(list.slice(-300))); } catch { /* private mode */ }
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(36);
}

/** record a wrong answer; same question repeats update the existing entry */
export function recordMistake(m: Omit<Mistake, 'id' | 'date' | 'reviewCount' | 'mastered'>): void {
  const list = load();
  const id = `${m.source}:${hash(m.question + m.correctAnswer)}`;
  const existing = list.find(x => x.id === id);
  if (existing) {
    existing.yourAnswer = m.yourAnswer;
    existing.mastered = false; // got it wrong again
  } else {
    list.push({ ...m, id, date: new Date().toISOString().slice(0, 10), reviewCount: 0, mastered: false });
  }
  save(list);
}

export function getMistakes(): Mistake[] { return load(); }

export function bumpReview(id: string): void {
  const list = load();
  const m = list.find(x => x.id === id);
  if (m) { m.reviewCount += 1; save(list); }
}

export function setMastered(id: string, mastered: boolean): void {
  const list = load();
  const m = list.find(x => x.id === id);
  if (m) { m.mastered = mastered; save(list); }
}

export function clearMastered(): void {
  save(load().filter(m => !m.mastered));
}

export function mistakeSummary(): { total: number; mastered: number; bySource: Record<string, number> } {
  const list = load();
  const bySource: Record<string, number> = {};
  for (const m of list) bySource[m.source] = (bySource[m.source] || 0) + 1;
  return { total: list.length, mastered: list.filter(m => m.mastered).length, bySource };
}
