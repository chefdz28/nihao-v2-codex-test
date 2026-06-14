// V2.8A — Reference dictionary core. Builds a canonical, de-duplicated word list
// from the existing HSK1 data plus a clean HSK2 batch, with safe slug generation
// for individual word pages at /dictionary/:slug. Static (in-code) so every word
// page is always indexable — independent of Supabase.
import { hsk1FullLessons } from '@/data/hsk1-full';
import { hsk2Batch } from '@/data/dictionaryHsk2';
import { dialogueWords } from '@/data/dictionaryDialogueWords';
import { storyWords } from '@/data/dictionaryStoryWords';

export interface DictExample { zh: string; py: string; ar: string; en?: string }
export interface DictWord {
  slug: string;          // url-safe, unique
  chinese: string;       // 你好
  pinyin: string;        // nǐ hǎo
  arabic: string;        // مرحباً
  english?: string;
  category: string;      // inferred part-of-speech / topic bucket (Arabic label)
  hsk: 1 | 2;
  examples: DictExample[];
  related: string[];     // slugs of related words
}

// ---- pinyin → ascii (strip tone marks) for slug + dedup ----
const TONE_MAP: Record<string, string> = {
  'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
  'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
  'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
  'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
  'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
  'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', 'ü': 'v',
};
export function stripTones(py: string): string {
  return py.split('').map(c => TONE_MAP[c] || c).join('');
}

/** url-safe slug from pinyin (tone-stripped). Falls back to a hash of the hanzi. */
export function wordSlug(chinese: string, pinyin: string): string {
  let base = stripTones(pinyin || '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) {
    // pure-hanzi fallback: deterministic short code from char codepoints
    base = 'w-' + Array.from(chinese).map(c => c.codePointAt(0)!.toString(36)).join('');
  }
  return base;
}

/** dedup key — same Chinese char(s) + same tone-stripped pinyin = duplicate. */
function dedupKey(chinese: string, pinyin: string): string {
  return chinese.trim() + '|' + stripTones(pinyin || '').toLowerCase().replace(/\s+/g, '');
}

// ---- lightweight category inference (Arabic labels) ----
function inferCategory(w: { chinese: string; arabic: string; english?: string }): string {
  const en = (w.english || '').toLowerCase();
  const ar = w.arabic || '';
  const zh = w.chinese;
  // numbers
  if (/^(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|zero|number)\b/.test(en)
      || /[一二三四五六七八九十百千万零]/.test(zh) && zh.length <= 2) return 'أرقام';
  // pronouns
  if (/\b(i|you|he|she|we|they|it|me|this|that|who|what|where|how|which)\b/.test(en)
      || ['أنا','أنت','أنتم','هو','هي','نحن','هم','هذا','هذه','ذلك','من','ماذا','أين','كيف'].some(p => ar.includes(p))) return 'ضمائر وأسئلة';
  // time
  if (/\b(year|month|day|week|today|tomorrow|yesterday|now|time|hour|minute|o'clock|morning|afternoon|evening)\b/.test(en)) return 'الوقت والتواريخ';
  // verbs
  if (/\b(to |go|come|eat|drink|see|look|listen|speak|say|read|write|buy|sit|do|make|like|want|have|love|call|work|study|live|sleep|open|wait)\b/.test(en)) return 'أفعال';
  // measure / particles
  if (/\b(measure word|particle)\b/.test(en)) return 'أدوات وكلمات قياس';
  // adjectives
  if (/\b(big|small|good|bad|hot|cold|new|old|many|much|happy|beautiful|tall|busy|right|expensive)\b/.test(en)) return 'صفات';
  // greetings / phrases
  if (/\b(hello|goodbye|thanks|sorry|please|welcome)\b/.test(en) || ['مرحباً','شكراً','آسف','وداعاً','عفواً'].some(p => ar.includes(p))) return 'تحيات وعبارات';
  // places
  if (/\b(school|home|hospital|shop|store|restaurant|china|country|place|station)\b/.test(en)) return 'أماكن';
  // family / people
  if (/\b(mother|father|friend|teacher|student|doctor|son|daughter|people|person|name)\b/.test(en)) return 'أشخاص وعائلة';
  // food
  if (/\b(rice|water|tea|food|eat|apple|meat|noodle|cup|dish)\b/.test(en)) return 'طعام وشراب';
  return 'كلمات عامة';
}

// ---- example sentence lookup from HSK1 lessons (best-effort) ----
// We attach a simple example only when the word appears in a lesson's data.
// For words without a stored sentence, a minimal example is generated from the
// word itself is NOT done (to avoid fake content) — examples stay empty.

interface RawWord { chinese: string; pinyin: string; arabic: string; english?: string; hsk: 1 | 2; examples?: DictExample[] }

function collectRaw(): RawWord[] {
  const out: RawWord[] = [];
  for (const lesson of hsk1FullLessons) {
    for (const v of lesson.vocabulary) {
      out.push({ chinese: v.chinese, pinyin: v.pinyin, arabic: v.arabic, english: v.english, hsk: 1 });
    }
  }
  for (const w of hsk2Batch) {
    out.push({ chinese: w.chinese, pinyin: w.pinyin, arabic: w.arabic, english: w.english, hsk: 2, examples: w.examples });
  }
  for (const w of dialogueWords) {
    out.push({ chinese: w.chinese, pinyin: w.pinyin, arabic: w.arabic, english: w.english, hsk: w.hsk, examples: w.examples });
  }
  for (const w of storyWords) {
    out.push({ chinese: w.chinese, pinyin: w.pinyin, arabic: w.arabic, english: w.english, hsk: w.hsk, examples: w.examples });
  }
  return out;
}

// ---- build the canonical, de-duplicated dictionary ----
function build(): DictWord[] {
  const seen = new Set<string>();
  const slugs = new Set<string>();
  const words: DictWord[] = [];

  for (const r of collectRaw()) {
    const key = dedupKey(r.chinese, r.pinyin);
    if (seen.has(key)) continue;          // duplication protection
    seen.add(key);

    let slug = wordSlug(r.chinese, r.pinyin);
    if (slugs.has(slug)) {                // slug collision (homophones) → suffix
      let i = 2;
      while (slugs.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
    slugs.add(slug);

    words.push({
      slug,
      chinese: r.chinese,
      pinyin: r.pinyin,
      arabic: r.arabic,
      english: r.english,
      category: inferCategory(r),
      hsk: r.hsk,
      examples: r.examples || [],
      related: [],
    });
  }

  // related words: same category, up to 4 (skip self)
  const byCat = new Map<string, DictWord[]>();
  for (const w of words) {
    if (!byCat.has(w.category)) byCat.set(w.category, []);
    byCat.get(w.category)!.push(w);
  }
  for (const w of words) {
    const peers = (byCat.get(w.category) || []).filter(p => p.slug !== w.slug);
    w.related = peers.slice(0, 4).map(p => p.slug);
  }

  return words;
}

export const dictionaryWords: DictWord[] = build();

export function wordBySlug(slug: string): DictWord | undefined {
  return dictionaryWords.find(w => w.slug === slug);
}

export const dictionaryCategories: string[] = Array.from(
  new Set(dictionaryWords.map(w => w.category))
).sort();

export const dictionarySlugs: string[] = dictionaryWords.map(w => w.slug);
