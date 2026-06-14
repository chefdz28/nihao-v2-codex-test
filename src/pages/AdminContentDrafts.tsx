import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Trash2, Eye, Download, Copy, Check, X, ArrowLeft, AlertTriangle, ClipboardList } from 'lucide-react';
import {
  listDrafts, saveDraft, setStatus, deleteDraft, isFallbackMode,
  draftToMarkdown, draftToJson, draftToStaticArticle,
  parseFaq, parseLinks, seoChecklist, isReadyToConvert,
  type ContentDraft, type DraftStatus, type DraftFAQ, type DraftLink,
} from '@/lib/adminDrafts';
import AdminMarkdown from '@/components/AdminMarkdown';

const STATUSES: DraftStatus[] = ['draft', 'review', 'ready', 'archived'];
const STATUS_AR: Record<DraftStatus, string> = { draft: 'مسودة', review: 'مراجعة', ready: 'جاهز', archived: 'مؤرشف' };
const STATUS_COLOR: Record<DraftStatus, string> = {
  draft: 'text-[#a0a0a0]', review: 'text-[#f59e0b]', ready: 'text-[#10b981]', archived: 'text-[#666]',
};

const EMPTY: ContentDraft = {
  id: '', slug: '', title_ar: '', meta_title_ar: '', meta_description_ar: '',
  target_keyword: '', secondary_keywords: [], category: '', content_markdown: '',
  faq_json: [], internal_links_json: [], status: 'draft', notes: '',
};

/**
 * V2.7A /admin/content-drafts — admin-only SEO draft manager.
 * ADMIN ONLY. Drafts are never public: no public route, not in sitemap/llms.txt,
 * not shown in /blog or /study-in-china. This page is reached only behind
 * AdminRoute (isAdmin) and protected at the database level by RLS.
 */
export default function AdminContentDrafts() {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DraftStatus | 'all'>('all');
  const [editing, setEditing] = useState<ContentDraft | null>(null);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState('');
  const [fallback, setFallback] = useState(false);

  const refresh = useCallback(async () => {
    const list = await listDrafts();
    setDrafts(list);
    setFallback(isFallbackMode());
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await listDrafts();
      if (!active) return;
      setDrafts(list);
      setFallback(isFallbackMode());
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const filtered = drafts.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return [d.title_ar, d.slug, d.target_keyword, d.category].some(v => (v || '').toLowerCase().includes(q));
  });

  const onSave = async () => {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.title_ar.trim()) { alert('العنوان والرابط (slug) مطلوبان'); return; }
    await saveDraft(editing);
    setEditing(null);
    setPreview(false);
    refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm('حذف هذه المسودة نهائياً؟ (يمكنك بدلاً من ذلك أرشفتها)')) return;
    await deleteDraft(id);
    refresh();
  };

  const copy = (text: string, tag: string) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(tag); setTimeout(() => setCopied(''), 1500); });
  };

  // ---------------- editor ----------------
  if (editing) {
    const d = editing;
    const checks = seoChecklist(d);
    const ready = isReadyToConvert(d);
    const set = (patch: Partial<ContentDraft>) => setEditing({ ...d, ...patch });

    return (
      <div className="max-w-[1100px] mx-auto px-6 py-8" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setEditing(null); setPreview(false); }} className="btn-secondary text-sm py-2 px-4 inline-flex"><ArrowLeft size={14} /> رجوع للقائمة</button>
          <div className="flex gap-2">
            <button onClick={() => setPreview(p => !p)} className="btn-secondary text-sm py-2 px-4"><Eye size={14} /> {preview ? 'تحرير' : 'معاينة'}</button>
            <button onClick={onSave} className="btn-primary text-sm py-2 px-5"><Check size={14} /> حفظ</button>
          </div>
        </div>

        {!preview ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* form */}
            <div className="lg:col-span-2 space-y-4">
              <Field label="العنوان بالعربية *"><input value={d.title_ar} onChange={e => set({ title_ar: e.target.value })} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="الرابط (slug) *"><input value={d.slug} onChange={e => set({ slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })} className={inputCls} dir="ltr" /></Field>
                <Field label="التصنيف"><input value={d.category || ''} onChange={e => set({ category: e.target.value })} className={inputCls} /></Field>
              </div>
              <Field label="الكلمة المفتاحية المستهدفة"><input value={d.target_keyword || ''} onChange={e => set({ target_keyword: e.target.value })} className={inputCls} /></Field>
              <Field label="كلمات مفتاحية ثانوية (افصل بفاصلة)"><input value={(d.secondary_keywords || []).join('، ')} onChange={e => set({ secondary_keywords: e.target.value.split(/[،,]/).map(s => s.trim()).filter(Boolean) })} className={inputCls} /></Field>
              <Field label="عنوان الميتا"><input value={d.meta_title_ar || ''} onChange={e => set({ meta_title_ar: e.target.value })} className={inputCls} /></Field>
              <Field label="وصف الميتا"><textarea value={d.meta_description_ar || ''} onChange={e => set({ meta_description_ar: e.target.value })} rows={2} className={inputCls} /></Field>
              <Field label="المحتوى (Markdown)"><textarea value={d.content_markdown || ''} onChange={e => set({ content_markdown: e.target.value })} rows={14} className={inputCls + ' font-mono text-sm'} dir="auto" /></Field>
              <Field label="الأسئلة الشائعة (JSON: [{&quot;q&quot;,&quot;a&quot;}])">
                <textarea value={JSON.stringify(d.faq_json || [], null, 2)} onChange={e => { try { set({ faq_json: JSON.parse(e.target.value) as DraftFAQ[] }); } catch { /* keep typing */ } }} rows={5} className={inputCls + ' font-mono text-xs'} dir="ltr" />
              </Field>
              <Field label="روابط داخلية (JSON: [{&quot;path&quot;,&quot;label&quot;}])">
                <textarea value={JSON.stringify(d.internal_links_json || [], null, 2)} onChange={e => { try { set({ internal_links_json: JSON.parse(e.target.value) as DraftLink[] }); } catch { /* keep typing */ } }} rows={4} className={inputCls + ' font-mono text-xs'} dir="ltr" />
              </Field>
              <Field label="ملاحظات (داخلية)"><textarea value={d.notes || ''} onChange={e => set({ notes: e.target.value })} rows={2} className={inputCls} /></Field>
            </div>

            {/* side: status, checklist, export */}
            <div className="space-y-4">
              <div className="liquid-glass p-4 rounded-2xl">
                <p className="text-xs font-display font-semibold uppercase mb-2" style={{ color: 'var(--color-text-tertiary)' }}>الحالة</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => set({ status: s })} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${d.status === s ? 'bg-[#FF3333] text-white' : 'bg-white/5 ' + STATUS_COLOR[s]}`}>{STATUS_AR[s]}</button>
                  ))}
                </div>
              </div>

              <div className="liquid-glass p-4 rounded-2xl">
                <p className="text-xs font-display font-semibold uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)' }}><ClipboardList size={13} /> فحص SEO</p>
                <ul className="space-y-1.5">
                  {checks.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {c.pass ? <Check size={13} className="text-[#10b981] shrink-0 mt-0.5" /> : <X size={13} className="text-[#FF3333] shrink-0 mt-0.5" />}
                      {c.label}
                    </li>
                  ))}
                </ul>
                <p className={`text-xs mt-3 font-semibold ${ready ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                  {ready ? '✓ جاهز للتحويل لمقال ثابت' : '… أكمل الفحوصات قبل التحويل'}
                </p>
              </div>

              <div className="liquid-glass p-4 rounded-2xl">
                <p className="text-xs font-display font-semibold uppercase mb-3" style={{ color: 'var(--color-text-tertiary)' }}>تصدير</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => copy(draftToJson(d), 'json')} className="btn-secondary text-xs py-2 px-3 justify-center">{copied === 'json' ? <><Check size={12} /> نُسخ</> : <><Copy size={12} /> نسخ JSON</>}</button>
                  <button onClick={() => copy(draftToMarkdown(d), 'md')} className="btn-secondary text-xs py-2 px-3 justify-center">{copied === 'md' ? <><Check size={12} /> نُسخ</> : <><Download size={12} /> نسخ Markdown</>}</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DraftPreview d={d} />
        )}
      </div>
    );
  }

  // ---------------- list ----------------
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-black text-3xl text-white flex items-center gap-3 font-arabic">
          <FileText className="text-[#FF3333]" /> مسودات المحتوى
        </h1>
        <div className="flex gap-2">
          <Link to="/admin" className="btn-secondary text-sm py-2 px-4">لوحة الإدارة</Link>
          <button onClick={() => { setEditing({ ...EMPTY }); setPreview(false); }} className="btn-primary text-sm py-2 px-5"><Plus size={14} /> مسودة جديدة</button>
        </div>
      </div>
      <p className="text-xs font-arabic mb-5" style={{ color: 'var(--color-text-tertiary)' }}>
        إدارة داخلية فقط — هذه المسودات لا تظهر للطلاب ولا في خريطة الموقع ولا في المدونة. تُحوّل يدوياً لمقالات ثابتة عند جاهزيتها.
      </p>

      {fallback && (
        <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4 flex items-start gap-3 mb-5">
          <AlertTriangle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
          <p className="text-xs font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            جداول Supabase غير متاحة بعد (لم يُشغّل ملف الهجرة، أو RLS يمنع الوصول). يعمل المحرر مؤقتاً بالتخزين المحلي في هذا المتصفح فقط. شغّل ملف الهجرة لتفعيل الحفظ السحابي.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالعنوان أو الكلمة المفتاحية أو الرابط..." className={inputCls + ' pr-10'} />
        </div>
        <div className="flex gap-1 liquid-glass rounded-xl p-1">
          <button onClick={() => setStatusFilter('all')} className={`px-3 py-2 rounded-lg text-xs font-semibold ${statusFilter === 'all' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0]'}`}>الكل</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${statusFilter === s ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0]'}`}>{STATUS_AR[s]}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>جارٍ التحميل...</p>
      ) : filtered.length === 0 ? (
        <div className="liquid-glass p-10 text-center rounded-2xl">
          <FileText size={32} className="text-[#FF3333] mx-auto mb-3" />
          <p className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>لا توجد مسودات بعد. أنشئ مسودتك الأولى.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => (
            <div key={d.id} className="liquid-glass p-4 rounded-2xl flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 ${STATUS_COLOR[d.status]}`}>{STATUS_AR[d.status]}</span>
                  {d.category && <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>{d.category}</span>}
                  {d.updated_at && <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>· {d.updated_at.slice(0, 10)}</span>}
                </div>
                <p className="text-sm font-bold text-white font-arabic truncate">{d.title_ar || '(بدون عنوان)'}</p>
                <p className="text-xs truncate" dir="ltr" style={{ color: 'var(--color-text-tertiary)' }}>/{d.slug} {d.target_keyword ? `· 🎯 ${d.target_keyword}` : ''}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <select value={d.status} onChange={e => setStatus(d.id, e.target.value as DraftStatus).then(refresh)} className="bg-[#161616] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_AR[s]}</option>)}
                </select>
                <button onClick={() => { setEditing(d); setPreview(false); }} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white" title="تحرير"><FileText size={14} /></button>
                <button onClick={() => onDelete(d.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#FF3333]/20 flex items-center justify-center text-[#FF3333]" title="حذف"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-display font-semibold mb-1.5 block font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#FF3333]/50 outline-none font-arabic';

function DraftPreview({ d }: { d: ContentDraft }) {
  const [copied, setCopied] = useState('');
  const copy = (text: string, tag: string) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(tag); setTimeout(() => setCopied(''), 1500); });
  };
  // V2.7A.2: tolerant parsing — accepts alternate key names and JSON strings.
  const faqParsed = parseFaq(d.faq_json);
  const linksParsed = parseLinks(d.internal_links_json);

  return (
    <div className="max-w-[760px] mx-auto" dir="rtl">
      <div className="rounded-2xl border border-[#FF3333]/20 bg-[#FF3333]/5 p-3 mb-5 text-center">
        <p className="text-xs font-arabic text-[#FF3333]">معاينة داخلية للإدارة فقط — هذه الصفحة غير منشورة وغير مفهرسة</p>
      </div>

      {/* Export row */}
      <div className="liquid-glass p-3 rounded-2xl mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-arabic ms-1" style={{ color: 'var(--color-text-tertiary)' }}>تصدير:</span>
        <button onClick={() => copy(draftToMarkdown(d), 'md')} className="btn-secondary text-xs py-1.5 px-3">{copied === 'md' ? '✓ نُسخ' : 'نسخ Markdown'}</button>
        <button onClick={() => copy(draftToJson(d), 'json')} className="btn-secondary text-xs py-1.5 px-3">{copied === 'json' ? '✓ نُسخ' : 'نسخ JSON'}</button>
        <button onClick={() => copy(draftToStaticArticle(d), 'static')} className="btn-secondary text-xs py-1.5 px-3">{copied === 'static' ? '✓ نُسخ' : 'نسخ صيغة المقال الثابت'}</button>
      </div>

      {/* SEO snippet preview */}
      <div className="liquid-glass p-4 rounded-2xl mb-6">
        <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }} dir="ltr">cnihao.com/blog/{d.slug}</p>
        <p className="text-lg text-[#6ea8fe] font-arabic">{d.meta_title_ar || d.title_ar}</p>
        <p className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{d.meta_description_ar || '(لا يوجد وصف ميتا)'}</p>
      </div>

      <h1 className="font-display font-black text-3xl text-white mb-4 font-arabic leading-snug">{d.title_ar}</h1>

      {/* Rendered Markdown */}
      <div className="mb-6">
        <AdminMarkdown source={d.content_markdown || ''} />
      </div>

      {/* FAQ */}
      {(faqParsed.items.length > 0 || faqParsed.error) && (
        <>
          <h2 className="font-display font-bold text-xl text-white mb-3 font-arabic">الأسئلة الشائعة</h2>
          {faqParsed.error && (
            <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-3 mb-3">
              <p className="text-xs font-arabic text-[#f59e0b]">{faqParsed.error}</p>
            </div>
          )}
          <div className="space-y-2 mb-6">
            {faqParsed.items.map((f, i) => (
              f.unsupported ? (
                <div key={i} className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-3">
                  <p className="text-xs font-arabic text-[#f59e0b]">عنصر سؤال يحتوي مفاتيح غير مدعومة (FAQ item has unsupported keys)</p>
                  <p className="text-[10px] font-mono mt-1" dir="ltr" style={{ color: 'var(--color-text-tertiary)' }}>keys: {(f.rawKeys || []).join(', ') || '(none)'}</p>
                </div>
              ) : (
                <div key={i} className="liquid-glass p-4 rounded-xl">
                  <p className="text-sm font-bold text-white font-arabic mb-1 flex items-start gap-2">
                    <span className="text-[#FF3333] shrink-0">س:</span> <span>{f.q || <em style={{ color: 'var(--color-text-tertiary)' }}>(سؤال فارغ)</em>}</span>
                  </p>
                  <p className="text-sm font-arabic flex items-start gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="text-[#10b981] shrink-0">ج:</span> <span>{f.a || <em style={{ color: 'var(--color-text-tertiary)' }}>(إجابة فارغة)</em>}</span>
                  </p>
                </div>
              )
            ))}
          </div>
        </>
      )}

      {/* Internal links */}
      {(linksParsed.items.length > 0 || linksParsed.error) && (
        <>
          <h2 className="font-display font-bold text-lg text-white mb-2 font-arabic">روابط داخلية</h2>
          {linksParsed.error && (
            <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-3 mb-3">
              <p className="text-xs font-arabic text-[#f59e0b]">{linksParsed.error}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {linksParsed.items.map((l, i) => (
              l.unsupported ? (
                <div key={i} className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-2 px-3">
                  <p className="text-[10px] font-mono" dir="ltr" style={{ color: 'var(--color-text-tertiary)' }}>link item unsupported keys: {(l.rawKeys || []).join(', ') || '(none)'}</p>
                </div>
              ) : l.external ? (
                <a key={i} href={l.path} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2 px-4 font-arabic inline-flex items-center gap-2">
                  {l.label} <span dir="ltr" style={{ color: 'var(--color-text-tertiary)' }}>{l.path} ↗</span>
                </a>
              ) : (
                <Link key={i} to={l.path} className="btn-secondary text-xs py-2 px-4 font-arabic inline-flex items-center gap-2">
                  {l.label} <span dir="ltr" style={{ color: 'var(--color-text-tertiary)' }}>{l.path}</span>
                </Link>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
}
