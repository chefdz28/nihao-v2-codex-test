// V3.8 — local knowledge search ("RAG" over NiHao's own data). NO API, no
// secrets: it indexes the existing dictionary / grammar / articles / stories /
// dialogues already shipped in the app and answers from them. This module is
// only imported by the AI Teacher (lazy) page, so it does NOT inflate the main
// bundle.
import { dictionaryWords } from '@/data/dictionaryCore';
import { grammarFallback } from '@/data/grammarFallback2';
import { articles } from '@/data/articles';
import { seoSprint1All } from '@/data/seoSprint1b';
import { stories } from '@/data/stories2';

export type KnowledgeType = 'word' | 'grammar' | 'article' | 'story' | 'lesson' | 'writing';

export interface KnowledgeResult {
  type: KnowledgeType;
  title: string;
  chinese?: string;
  pinyin?: string;
  arabic?: string;
  english?: string;
  hsk?: number;
  route?: string;
  score: number;
}

// ---- normalization ----
const TONE = '\u0304\u0301\u030c\u0300\u0306'; // combining tone marks
function stripTones(s: string): string {
  return s.normalize('NFD').replace(new RegExp('[' + TONE + ']', 'g'), '').normalize('NFC');
}
// strip Arabic diacritics + tatweel + normalize alef/ya/ta-marbuta for matching
function normAr(s: string): string {
  return s
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647');
}
function norm(s: string): string {
  return normAr(stripTones((s || '').toLowerCase().trim()));
}

// Arabic topic hints → words likely related (lets "كلمات عن الأكل" work without
// a tagging system: we match the topic word against each entry's Arabic gloss).
const TOPIC_SYNONYMS: Record<string, string[]> = {
  'اكل': ['اكل', 'طعام', 'ياكل', 'وجب', 'مطعم', 'ارز', 'خبز', 'ماء', 'شاي', 'فاكه', 'لحم', 'طبخ', 'جوع'],
  'طعام': ['اكل', 'طعام', 'وجب', 'مطعم', 'ارز'],
  'وقت': ['وقت', 'ساع', 'يوم', 'الان', 'غدا', 'امس', 'اسبوع', 'شهر', 'سنه', 'دقيق', 'صباح', 'مساء', 'ليل'],
  'سفر': ['سفر', 'طائر', 'مطار', 'قطار', 'سياره', 'فندق', 'تذكر', 'رحل', 'حقيب'],
  'عائله': ['عائل', 'ام', 'اب', 'اخ', 'اخت', 'ابن', 'بنت', 'جد', 'زوج', 'طفل', 'اسر'],
  'دراسه': ['درس', 'مدرس', 'معلم', 'طالب', 'كتاب', 'جامع', 'صف', 'امتحان', 'قلم'],
  'تسوق': ['تسوق', 'شراء', 'يشتري', 'متجر', 'سعر', 'نقود', 'مال', 'رخيص', 'غالي'],
  'الوان': ['لون', 'احمر', 'ازرق', 'اخضر', 'اصفر', 'ابيض', 'اسود'],
  'ارقام': ['رقم', 'عدد', 'واحد', 'اثنان', 'ثلاث', 'مئه', 'الف'],
};

// Detect an HSK level constraint in the query (HSK1/2/3).
function hskFilter(q: string): number | undefined {
  if (/hsk\s*1|مستوى\s*1|الاول/.test(q)) return 1;
  if (/hsk\s*2|مستوى\s*2|الثاني/.test(q)) return 2;
  if (/hsk\s*3|مستوى\s*3|الثالث/.test(q)) return 3;
  return undefined;
}

// Pull a Chinese substring from the query if present (so "معنى 你好" finds 你好).
function chineseIn(q: string): string {
  const m = q.match(/[\u3400-\u9FFF]+/g);
  return m ? m.join('') : '';
}

// ---- per-source scorers ----
function searchWords(qRaw: string, qn: string, hsk?: number): KnowledgeResult[] {
  const zh = chineseIn(qRaw);
  // topic expansion
  const topicKeys = Object.keys(TOPIC_SYNONYMS).filter(k => qn.includes(norm(k)));
  const topicTerms = topicKeys.flatMap(k => TOPIC_SYNONYMS[k]).map(norm);
  // content tokens (drop short filler words like كيف/أقول/عن/بال)
  const STOP = new Set(['كيف', 'اقول', 'قول', 'عن', 'في', 'من', 'هي', 'هو', 'ما', 'معنى', 'يعني', 'بالصيني', 'بالصينيه', 'الصينيه', 'كلمه', 'كلمات', 'اعطني', 'اعطيني', 'اريد', 'جمله']);
  const tokens = qn.split(/\s+/).map(norm).filter(t => t.length >= 2 && !STOP.has(t));

  const out: KnowledgeResult[] = [];
  for (const w of dictionaryWords) {
    if (hsk && w.hsk !== hsk) continue;
    let score = 0;
    if (zh && w.chinese.includes(zh)) score += 100;            // exact-ish Chinese
    const py = stripTones(w.pinyin.toLowerCase());
    if (qn && py.replace(/\s/g, '') === qn.replace(/\s/g, '')) score += 90;
    else if (qn && py.includes(qn) && qn.length >= 2) score += 40;
    const ar = norm(w.arabic);
    if (qn && ar === qn) score += 70;
    else if (qn && qn.length >= 2 && ar.includes(qn)) score += 35;
    // token-level Arabic match (handles "كيف أقول شكرا بالصيني")
    else if (tokens.some(t => ar === t)) score += 55;
    else if (tokens.some(t => ar.includes(t) && t.length >= 3)) score += 25;
    if (w.english && qn && norm(w.english).includes(qn) && qn.length >= 2) score += 30;
    // topic match against Arabic gloss
    if (topicTerms.length && topicTerms.some(t => ar.includes(t))) score += 25;
    if (score > 0) {
      out.push({
        type: 'word', title: w.chinese, chinese: w.chinese, pinyin: w.pinyin,
        arabic: w.arabic, english: w.english, hsk: w.hsk,
        route: `/dictionary/${w.slug}`, score,
      });
    }
  }
  return out;
}

function searchGrammar(qRaw: string, qn: string): KnowledgeResult[] {
  const zh = chineseIn(qRaw);
  const out: KnowledgeResult[] = [];
  const banks = [grammarFallback];
  for (const bank of banks) {
    const rec = bank as unknown as Record<string, { points?: Array<Record<string, unknown>> }>;
    for (const lessonId of Object.keys(rec)) {
      const data = rec[lessonId];
      for (const p of data.points || []) {
        const title = String(p.title_ar || p.title_en || '');
        const pattern = String(p.pattern || '');
        const expl = String(p.explanation_ar || '');
        let score = 0;
        if (zh && (pattern.includes(zh) || title.includes(zh))) score += 80;
        if (qn && norm(title).includes(qn) && qn.length >= 2) score += 40;
        if (qn && norm(pattern).includes(qn) && qn.length >= 2) score += 30;
        if (qn && norm(expl).includes(qn) && qn.length >= 3) score += 20;
        if (score > 0) {
          out.push({
            type: 'grammar', title, chinese: pattern || undefined,
            arabic: expl.slice(0, 160), route: `/lesson/${lessonId}`, score,
          });
        }
      }
    }
  }
  return out;
}

function searchArticles(qn: string): KnowledgeResult[] {
  const out: KnowledgeResult[] = [];
  for (const a of articles) {
    const title = norm(a.title || '');
    let score = 0;
    if (qn && qn.length >= 3 && title.includes(qn)) score += 45;
    if (score > 0) out.push({ type: 'article', title: a.title, arabic: a.title, route: `/blog/${a.slug}`, score });
  }
  for (const a of seoSprint1All) {
    const title = norm(a.title || '');
    const kw = norm((a as { keyword?: string }).keyword || '');
    let score = 0;
    if (qn && qn.length >= 3 && title.includes(qn)) score += 45;
    if (qn && qn.length >= 3 && kw && kw.includes(qn)) score += 40;
    if (score > 0) out.push({ type: 'article', title: a.title, arabic: a.title, route: `/blog/${a.slug}`, score });
  }
  return out;
}

function searchStories(qRaw: string, qn: string): KnowledgeResult[] {
  const zh = chineseIn(qRaw);
  const out: KnowledgeResult[] = [];
  for (const s of stories) {
    const titleAr = norm(s.title_ar || '');
    let score = 0;
    if (qn && qn.length >= 3 && titleAr.includes(qn)) score += 35;
    if (zh && (s.title_zh || '').includes(zh)) score += 50;
    if (score > 0) {
      out.push({
        type: 'story', title: s.title_ar || s.title_zh, chinese: s.title_zh,
        pinyin: s.title_py, arabic: s.title_ar, route: `/stories/${s.id}`, score,
      });
    }
  }
  return out;
}

/**
 * Search NiHao's local data and return the top results. Pure local logic; no
 * network, no API. Returns [] when nothing matches (caller shows the fallback).
 */
export function searchKnowledge(query: string, limit = 5): KnowledgeResult[] {
  const qRaw = (query || '').trim();
  const qn = norm(qRaw);
  if (!qn && !chineseIn(qRaw)) return [];
  const hsk = hskFilter(qn);

  const all = [
    ...searchWords(qRaw, qn, hsk),
    ...searchGrammar(qRaw, qn),
    ...searchArticles(qn),
    ...searchStories(qRaw, qn),
  ];
  all.sort((a, b) => b.score - a.score);

  // de-dupe by title+type, keep highest
  const seen = new Set<string>();
  const out: KnowledgeResult[] = [];
  for (const r of all) {
    const key = r.type + ':' + r.title;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}

// V3.8.2 — exact-meaning result filtering. Direct meaning/translation questions
// (and bare single-word queries) should show ONLY the strongest result, not a
// list of loosely-related cards. Topic searches keep multiple results.

const MEANING_PHRASES = [
  'معنى', 'ما معنى', 'ايش معنى', 'وش معنى', 'ماذا يعني', 'وش يعني', 'ايش يعني', 'يعني ايش',
  'ترجمة', 'ترجم', 'كيف أقول', 'كيف اقول', 'كيف نقول', 'بالصيني', 'بالصينية', 'معناها', 'معناه',
  'meaning', 'what does', 'what is', 'translate', 'how do i say', 'how to say',
];

/** True when the message is a direct "what does X mean / how do I say X" question,
 *  or a single bare token — cases where one exact answer is expected. */
export function isDirectMeaningQuery(raw: string): boolean {
  const s = (raw || '').toLowerCase();
  if (MEANING_PHRASES.some(p => s.includes(p))) return true;
  // topic searches ("كلمات ... عن ...") are NOT direct-meaning
  if (s.includes('كلمات') && (s.includes(' عن ') || s.includes('حول') || s.includes('about'))) return false;
  // single short token (one word, no spaces) → treat as a direct lookup
  const wc = (raw || '').trim().split(/\s+/).filter(Boolean).length;
  if (wc === 1) return true;
  return false;
}

/** For direct-meaning intent, reduce results to the strongest 1–2 (top result +
 *  an optional near-equal same-type synonym). For topic/other intent, return as-is
 *  (still capped by the caller's limit). Also re-ranks so an EXACT match on the
 *  target (Arabic gloss / Chinese / pinyin) is preferred over partial ones. */
export function filterKnowledgeResultsForIntent(
  raw: string,
  target: string,
  results: KnowledgeResult[],
): KnowledgeResult[] {
  if (results.length === 0) return results;
  if (!isDirectMeaningQuery(raw)) return results; // topic search → keep all

  const tnorm = norm(target);
  const tHasChinese = /[\u3400-\u9FFF]/.test(target);

  // exactness boost: exact Arabic gloss / exact Chinese / exact pinyin beats partial
  const scored = results.map(r => {
    let bonus = 0;
    let exact = false;
    const ar = norm(r.arabic || '');
    if (ar === tnorm) { bonus += 1000; exact = true; }
    else if (tnorm && (ar.includes(tnorm) || tnorm.includes(ar))) {
      bonus += 300;
      // closeness: the nearer the gloss length is to the target, the better
      // (so "قطة" beats "قطار"/"محطة القطار" for target "قط")
      bonus += Math.max(0, 40 - Math.abs(ar.length - tnorm.length) * 10);
    }
    if (tHasChinese && r.chinese && r.chinese === target) { bonus += 1200; exact = true; }
    if (r.pinyin && stripTones(r.pinyin.toLowerCase()).replace(/\s/g, '') === tnorm.replace(/\s/g, '')) { bonus += 800; exact = true; }
    // for direct meaning, prefer single words over articles/stories
    if (r.type === 'word') bonus += 50;
    return { r, eff: r.score + bonus, exact };
  }).sort((a, b) => b.eff - a.eff);

  const top = scored[0];
  const out: KnowledgeResult[] = [top.r];
  // Direct-meaning questions expect ONE answer. Only add a 2nd card when BOTH the
  // top and the second are EXACT matches of the same type (a real synonym pair) —
  // never a partial/loosely-related word. This keeps "قط" → only 猫, not 火车.
  const second = scored[1];
  if (second && top.exact && second.exact && second.r.type === top.r.type && second.eff >= top.eff * 0.9) {
    out.push(second.r);
  }
  return out;
}
