// V2.7A Admin Content Draft service. Talks to Supabase (admin_content_drafts +
// admin_content_audit_log). If the tables/RLS aren't ready yet, it falls back
// to localStorage so the admin UI still works for drafting offline. This is
// ADMIN-ONLY data; nothing here is ever rendered on public routes.
import { supabase } from '@/lib/supabase';

export type DraftStatus = 'draft' | 'review' | 'ready' | 'archived';

// V2.7A.1/.2 — normalize internal link paths so "pinyin" -> "/pinyin",
// "pinyin/" -> "/pinyin". Deep paths and external URLs are preserved.
export function normalizeLinkPath(path: string): string {
  if (!path) return path;
  const p = path.trim();
  if (/^https?:\/\//i.test(p)) return p;       // external URL — leave as-is
  if (p.startsWith('#') || p.startsWith('mailto:') || p.startsWith('tel:')) return p;
  // strip leading AND trailing slashes, then re-add a single leading slash.
  // "pinyin" -> "/pinyin", "pinyin/" -> "/pinyin", "/pinyin" -> "/pinyin",
  // "/blog/study-in-china-saudis" -> "/blog/study-in-china-saudis" (deep kept).
  const trimmed = p.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed) return '/';
  return '/' + trimmed;
}

export function isExternalUrl(path: string): boolean {
  return /^https?:\/\//i.test((path || '').trim());
}

export interface DraftFAQ { q: string; a: string }
export interface DraftLink { path: string; label: string }

// ---------------------------------------------------------------------------
// V2.7A.2 — tolerant parsers. JSONB columns can arrive as objects OR as strings
// that still need JSON.parse, and authors use different key names. These coerce
// any reasonable shape into the canonical {q,a} / {label,path} forms, and report
// unrecognized items instead of silently rendering empty.
// ---------------------------------------------------------------------------

/** Coerce a raw value (array | JSON string | null) into an array of records. */
export function coerceToArray(raw: unknown): { items: Record<string, unknown>[]; error: string | null } {
  if (raw == null || raw === '') return { items: [], error: null };
  let value: unknown = raw;
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return { items: [], error: null };
    try { value = JSON.parse(s); }
    catch { return { items: [], error: 'JSON غير صالح — تعذّر تحليل النص.' }; }
  }
  if (Array.isArray(value)) {
    return { items: value.filter(x => x && typeof x === 'object') as Record<string, unknown>[], error: null };
  }
  if (value && typeof value === 'object') {
    return { items: [value as Record<string, unknown>], error: null };
  }
  return { items: [], error: 'الشكل غير مدعوم — المتوقع مصفوفة من العناصر.' };
}

const pick = (o: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return undefined;
};

export interface ParsedFAQ { q: string; a: string; unsupported?: boolean; rawKeys?: string[] }
export interface ParsedLink { label: string; path: string; external: boolean; unsupported?: boolean; rawKeys?: string[] }

/** Normalize FAQ items: {q,a} | {question,answer} | {title,body}. */
export function parseFaq(raw: unknown): { items: ParsedFAQ[]; error: string | null } {
  const { items, error } = coerceToArray(raw);
  return {
    error,
    items: items.map(o => {
      const q = pick(o, ['q', 'question', 'title', 'Q', 'Question']);
      const a = pick(o, ['a', 'answer', 'body', 'A', 'Answer', 'text']);
      if (q || a) return { q: q || '', a: a || '' };
      return { q: '', a: '', unsupported: true, rawKeys: Object.keys(o) };
    }),
  };
}

/** Normalize link items: {label,path} | {label,url} | {text,href}. */
export function parseLinks(raw: unknown): { items: ParsedLink[]; error: string | null } {
  const { items, error } = coerceToArray(raw);
  return {
    error,
    items: items.map(o => {
      const label = pick(o, ['label', 'text', 'title', 'name']);
      const rawPath = pick(o, ['path', 'url', 'href', 'to', 'link']);
      if (label || rawPath) {
        const external = isExternalUrl(rawPath || '');
        return { label: label || (rawPath || ''), path: external ? (rawPath as string) : normalizeLinkPath(rawPath || ''), external };
      }
      return { label: '', path: '', external: false, unsupported: true, rawKeys: Object.keys(o) };
    }),
  };
}

/** Canonical forms for storage/export ({q,a} and {label,path}). */
export function canonicalFaq(raw: unknown): DraftFAQ[] {
  return parseFaq(raw).items.filter(f => !f.unsupported).map(f => ({ q: f.q, a: f.a }));
}
export function canonicalLinks(raw: unknown): DraftLink[] {
  return parseLinks(raw).items.filter(l => !l.unsupported).map(l => ({ label: l.label, path: l.path }));
}

export interface ContentDraft {
  id: string;
  slug: string;
  title_ar: string;
  meta_title_ar?: string | null;
  meta_description_ar?: string | null;
  target_keyword?: string | null;
  secondary_keywords?: string[] | null;
  category?: string | null;
  content_markdown?: string | null;
  content_json?: unknown;
  faq_json?: DraftFAQ[] | null;
  internal_links_json?: DraftLink[] | null;
  status: DraftStatus;
  notes?: string | null;
  last_updated?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

const TABLE = 'admin_content_drafts';
const AUDIT = 'admin_content_audit_log';
const LS_KEY = 'nihao_admin_drafts_fallback';

// ---- localStorage fallback ----
function lsLoad(): ContentDraft[] {
  try { return JSON.parse(window.localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsSave(list: ContentDraft[]) {
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { /* private mode */ }
}
function uuid(): string {
  try { return crypto.randomUUID(); } catch { return 'd-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
}

let useFallback = false;

export function isFallbackMode() { return useFallback; }

export async function listDrafts(): Promise<ContentDraft[]> {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    useFallback = false;
    return (data || []) as ContentDraft[];
  } catch {
    useFallback = true;
    return lsLoad().sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  }
}

async function audit(draftId: string | null, action: string, details?: unknown) {
  if (useFallback) return;
  try {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from(AUDIT).insert({ draft_id: draftId, action, details: details ?? null, created_by: u?.user?.id ?? null });
  } catch { /* audit is best-effort */ }
}

export async function saveDraft(draft: Partial<ContentDraft> & { slug: string; title_ar: string }): Promise<ContentDraft> {
  const now = new Date().toISOString();
  const payload: ContentDraft = {
    id: draft.id || uuid(),
    slug: draft.slug,
    title_ar: draft.title_ar,
    meta_title_ar: draft.meta_title_ar ?? null,
    meta_description_ar: draft.meta_description_ar ?? null,
    target_keyword: draft.target_keyword ?? null,
    secondary_keywords: draft.secondary_keywords ?? null,
    category: draft.category ?? null,
    content_markdown: draft.content_markdown ?? null,
    content_json: draft.content_json ?? null,
    faq_json: draft.faq_json ?? null,
    internal_links_json: draft.internal_links_json ?? null,
    status: draft.status || 'draft',
    notes: draft.notes ?? null,
    last_updated: draft.last_updated ?? now.slice(0, 10),
    updated_at: now,
  };

  if (!useFallback) {
    try {
      const isNew = !draft.id;
      const { data: u } = await supabase.auth.getUser();
      if (isNew) payload.created_by = u?.user?.id ?? null;
      const { data, error } = await supabase.from(TABLE).upsert(payload).select().single();
      if (error) throw error;
      await audit(payload.id, isNew ? 'create' : 'update', { slug: payload.slug, status: payload.status });
      return data as ContentDraft;
    } catch {
      useFallback = true; // fall through to localStorage
    }
  }
  // fallback
  const list = lsLoad();
  const idx = list.findIndex(d => d.id === payload.id);
  if (idx >= 0) list[idx] = payload; else { payload.created_at = now; list.push(payload); }
  lsSave(list);
  return payload;
}

export async function setStatus(id: string, status: DraftStatus): Promise<void> {
  if (!useFallback) {
    try {
      const { error } = await supabase.from(TABLE).update({ status }).eq('id', id);
      if (error) throw error;
      await audit(id, 'status_change', { status });
      return;
    } catch { useFallback = true; }
  }
  const list = lsLoad();
  const d = list.find(x => x.id === id);
  if (d) { d.status = status; d.updated_at = new Date().toISOString(); lsSave(list); }
}

export async function deleteDraft(id: string): Promise<void> {
  if (!useFallback) {
    try {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
      await audit(null, 'delete', { id });
      return;
    } catch { useFallback = true; }
  }
  lsSave(lsLoad().filter(d => d.id !== id));
}

// ---- export helpers ----
export function draftToMarkdown(d: ContentDraft): string {
  const lines: string[] = [];
  lines.push(`---`);
  lines.push(`slug: ${d.slug}`);
  lines.push(`title: ${d.title_ar}`);
  if (d.meta_title_ar) lines.push(`meta_title: ${d.meta_title_ar}`);
  if (d.meta_description_ar) lines.push(`meta_description: ${d.meta_description_ar}`);
  if (d.target_keyword) lines.push(`target_keyword: ${d.target_keyword}`);
  if (d.secondary_keywords?.length) lines.push(`secondary_keywords: ${d.secondary_keywords.join(', ')}`);
  if (d.category) lines.push(`category: ${d.category}`);
  lines.push(`status: ${d.status}`);
  if (d.last_updated) lines.push(`last_updated: ${d.last_updated}`);
  lines.push(`---`, '');
  lines.push(`# ${d.title_ar}`, '');
  lines.push(d.content_markdown || '');
  const faqItems = canonicalFaq(d.faq_json);
  if (faqItems.length) {
    lines.push('', '## الأسئلة الشائعة', '');
    faqItems.forEach(f => lines.push(`### ${f.q}`, f.a, ''));
  }
  const linkItems = canonicalLinks(d.internal_links_json);
  if (linkItems.length) {
    lines.push('', '## روابط داخلية', '');
    linkItems.forEach(l => lines.push(`- [${l.label}](${l.path})`));
  }
  return lines.join('\n');
}

export function draftToJson(d: ContentDraft): string {
  return JSON.stringify({
    slug: d.slug, title: d.title_ar, meta_title: d.meta_title_ar,
    meta_description: d.meta_description_ar, target_keyword: d.target_keyword,
    secondary_keywords: d.secondary_keywords, category: d.category,
    content_markdown: d.content_markdown,
    faq: canonicalFaq(d.faq_json),               // normalized {q,a}
    internal_links: canonicalLinks(d.internal_links_json), // normalized {label,path}
    status: d.status, last_updated: d.last_updated,
  }, null, 2);
}

// ---- SEO checklist ----
export interface SeoCheck { label: string; pass: boolean }
export function seoChecklist(d: ContentDraft): SeoCheck[] {
  const wordCount = (d.content_markdown || '').trim().split(/\s+/).filter(Boolean).length;
  const links = canonicalLinks(d.internal_links_json).length;
  const faqs = canonicalFaq(d.faq_json).length;
  return [
    { label: 'يوجد رابط (slug)', pass: !!d.slug?.trim() },
    { label: 'يوجد عنوان', pass: !!d.title_ar?.trim() },
    { label: 'يوجد وصف ميتا', pass: !!d.meta_description_ar?.trim() },
    { label: 'توجد كلمة مفتاحية مستهدفة', pass: !!d.target_keyword?.trim() },
    { label: `طول المحتوى كافٍ (${wordCount} كلمة، الهدف ≥ 300)`, pass: wordCount >= 300 },
    { label: `يوجد قسم أسئلة شائعة (${faqs})`, pass: faqs >= 1 },
    { label: `3 روابط داخلية على الأقل (${links})`, pass: links >= 3 },
    { label: 'الحالة = جاهز', pass: d.status === 'ready' },
  ];
}

export function isReadyToConvert(d: ContentDraft): boolean {
  return seoChecklist(d).filter(c => c.label !== 'الحالة = جاهز').every(c => c.pass);
}

// V2.7A.1 — export a draft in the V2.6 static SeoArticle data shape, ready to
// paste into src/data and wire as a static /blog/:slug article later.
export function draftToStaticArticle(d: ContentDraft): string {
  const esc = (v: string) => (v || '').replace(/'/g, "\\'");
  const links = canonicalLinks(d.internal_links_json).map(l =>
    `    { path: '${esc(l.path)}', label: '${esc(l.label)}' },`).join('\n');
  const faq = canonicalFaq(d.faq_json).map(f =>
    `    { q: '${esc(f.q)}', a: '${esc(f.a)}' },`).join('\n');
  const kws = (d.secondary_keywords || []).map(k => `'${esc(k)}'`).join(', ');
  return `{
  slug: '${esc(d.slug)}',
  keyword: '${esc(d.target_keyword || '')}',
  title: '${esc(d.title_ar)}',
  meta: '${esc(d.meta_description_ar || '')}',
  emoji: '\u{1F4C4}',
  secondaryKeywords: [${kws}],
  direct: '${esc((d.content_markdown || '').split('\n').find(Boolean) || d.title_ar)}',
  blocks: [
    // TODO: split content_markdown into typed blocks (p / h2 / list / ...)
  ],
  faq: [
${faq}
  ],
  links: [
${links}
  ],
  related: [],
  verifyNote: true,
  updated: '${esc(d.last_updated || new Date().toISOString().slice(0,10))}',
}`;
}
