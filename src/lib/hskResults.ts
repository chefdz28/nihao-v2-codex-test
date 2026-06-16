// HSK simulation results (localStorage). V2.2.1 stored HSK1 under
// nihao_hsk1_results; V3.2 generalizes to any level while keeping HSK1 backward
// compatible (HSK1 still reads/writes the original key).
export interface HskResult { date: string; score: number; total: number; passed: boolean; minutes: number }

function keyFor(level: number): string {
  return level === 1 ? 'nihao_hsk1_results' : `nihao_hsk${level}_results`;
}

export function loadHskResultsByLevel(level: number): HskResult[] {
  try { return JSON.parse(window.localStorage.getItem(keyFor(level)) || '[]'); } catch { return []; }
}

export function saveHskResultByLevel(level: number, r: HskResult): void {
  try {
    const all = loadHskResultsByLevel(level);
    all.push(r);
    window.localStorage.setItem(keyFor(level), JSON.stringify(all.slice(-20)));
  } catch { /* private mode */ }
}

// ---- Backward-compatible HSK1 helpers (unchanged signatures) ----
export function loadHskResults(): HskResult[] { return loadHskResultsByLevel(1); }
export function saveHskResult(r: HskResult): void { saveHskResultByLevel(1, r); }
