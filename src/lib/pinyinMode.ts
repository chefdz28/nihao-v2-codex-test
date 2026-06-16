// V3.4 — smart pinyin visibility. Preference persists in localStorage under
// 'nihao:pinyin-mode' with values 'show' | 'hide' | 'auto' (default 'auto').
// Auto logic: HSK1 → show, HSK2 → show, HSK3 → hide. Pinyin is never removed
// from data; this only controls visibility.
export type PinyinMode = 'show' | 'hide' | 'auto';

const KEY = 'nihao:pinyin-mode';

export function loadPinyinMode(): PinyinMode {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'show' || v === 'hide' || v === 'auto' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export function savePinyinMode(mode: PinyinMode): void {
  try { window.localStorage.setItem(KEY, mode); } catch { /* private mode */ }
}

/** Resolve whether pinyin should be visible for a given HSK level + mode. */
export function pinyinVisible(mode: PinyinMode, hsk?: 1 | 2 | 3): boolean {
  if (mode === 'show') return true;
  if (mode === 'hide') return false;
  // auto: show for HSK1/HSK2, hide for HSK3 (and default to show when unknown)
  return hsk === 3 ? false : true;
}
