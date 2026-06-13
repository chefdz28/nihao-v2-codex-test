// V2.0.5 number helpers: generate Chinese + pinyin for 0–100 algorithmically.

const DIGITS_ZH = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const DIGITS_PY = ['líng', 'yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ'];

export function numberToChinese(n: number): string {
  if (n < 0 || n > 100) return String(n);
  if (n === 100) return '一百';
  if (n < 10) return DIGITS_ZH[n];
  if (n === 10) return '十';
  if (n < 20) return '十' + DIGITS_ZH[n % 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return DIGITS_ZH[tens] + '十' + (ones ? DIGITS_ZH[ones] : '');
}

export function numberToPinyin(n: number): string {
  if (n < 0 || n > 100) return String(n);
  if (n === 100) return 'yìbǎi';
  if (n < 10) return DIGITS_PY[n];
  if (n === 10) return 'shí';
  if (n < 20) return 'shí' + (n % 10 === 2 ? "'èr" : DIGITS_PY[n % 10]);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return DIGITS_PY[tens] + 'shí' + (ones ? DIGITS_PY[ones] : '');
}

/** random int in [min, max] */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** build 4 hanzi options (1 correct + 3 close distractors) for a number */
export function numberOptions(n: number): { options: string[]; correct: string } {
  const correct = numberToChinese(n);
  const set = new Set<string>([correct]);
  // plausible distractors: digit swap, ±1, reversed tens/ones
  const candidates = [
    n >= 10 && n <= 99 ? numberToChinese((n % 10) * 10 + Math.floor(n / 10)) : numberToChinese((n + 3) % 101),
    numberToChinese((n + 1) % 101),
    numberToChinese((n + 10) % 101),
    numberToChinese(Math.max(0, n - 1)),
    numberToChinese((n + 5) % 101),
  ];
  for (const c of candidates) {
    if (set.size >= 4) break;
    set.add(c);
  }
  const options = [...set].sort(() => Math.random() - 0.5);
  return { options, correct };
}
