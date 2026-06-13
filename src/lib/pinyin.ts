// V2.0.4 pinyin helpers: local answer checking for type-the-pinyin exercises.
// Rules: case-insensitive, optional/collapsed spaces, punctuation ignored,
// tone marks must match for "correct"; a tone-stripped match returns
// 'almost' so the UI can say "check your tone marks".

const TONE_MAP: Record<string, string> = {
  'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
  'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
  'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
  'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
  'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
  'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
};

/** lowercase, strip punctuation, collapse whitespace */
export function normalizePinyin(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.,!?;:'"’！？。，、]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** also remove tone marks (and accept v as ü) */
export function stripTones(input: string): string {
  let out = '';
  for (const ch of normalizePinyin(input)) {
    out += TONE_MAP[ch] ?? ch;
  }
  return out.replace(/v/g, 'ü');
}

export type PinyinCheck = 'correct' | 'almost' | 'wrong';

/**
 * Compare a learner's typed pinyin with the expected answer.
 * 'correct' — exact match including tone marks (spacing/case/punct ignored)
 * 'almost'  — letters right, tone marks missing or different
 * 'wrong'   — letters differ
 */
export function checkPinyin(typed: string, expected: string): PinyinCheck {
  const t = normalizePinyin(typed);
  const e = normalizePinyin(expected);
  if (!t) return 'wrong';
  if (t === e || t.replace(/ /g, '') === e.replace(/ /g, '')) return 'correct';
  const ts = stripTones(typed).replace(/ /g, '');
  const es = stripTones(expected).replace(/ /g, '');
  if (ts === es) return 'almost';
  return 'wrong';
}
