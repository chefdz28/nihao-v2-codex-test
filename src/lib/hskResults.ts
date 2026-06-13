// V2.2.1 HSK1 simulation results (localStorage: nihao_hsk1_results)
export interface HskResult { date: string; score: number; total: number; passed: boolean; minutes: number }
const KEY = 'nihao_hsk1_results';
export function loadHskResults(): HskResult[] {
  try { return JSON.parse(window.localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
export function saveHskResult(r: HskResult): void {
  try {
    const all = loadHskResults();
    all.push(r);
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(-20)));
  } catch { /* private mode */ }
}
