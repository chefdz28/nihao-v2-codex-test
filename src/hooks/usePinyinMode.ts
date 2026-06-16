import { useState, useCallback } from 'react';
import { loadPinyinMode, savePinyinMode, pinyinVisible, type PinyinMode } from '@/lib/pinyinMode';

/** V3.4 — manage the persisted pinyin visibility preference. */
export function usePinyinMode() {
  const [mode, setMode] = useState<PinyinMode>(() => loadPinyinMode());

  const update = useCallback((m: PinyinMode) => {
    setMode(m);
    savePinyinMode(m);
  }, []);

  const isVisible = useCallback((hsk?: 1 | 2 | 3) => pinyinVisible(mode, hsk), [mode]);

  return { mode, setMode: update, isVisible };
}
