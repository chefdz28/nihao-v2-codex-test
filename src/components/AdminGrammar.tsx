import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, AlertTriangle, BookMarked, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchLessons } from '@/lib/dataService';
import type { LessonRow } from '@/types/supabase';
import type { GrammarPoint, GrammarExercise, GrammarExerciseType } from '@/types/grammar';

/**
 * V2.0.5 Admin → Grammar: list / add / delete grammar points and exercises
 * stored in the optional grammar tables. Fully additive:
 * - If the tables are missing, a clear notice points to optional-grammar.sql.
 * - If writes are blocked by RLS, the error message points to
 *   optional-grammar-admin-write.sql. The learner-facing fallback content
 *   keeps working regardless.
 */
export default function AdminGrammar() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState('');
  const [points, setPoints] = useState<GrammarPoint[]>([]);
  const [exercises, setExercises] = useState<GrammarExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // minimal add forms
  const [showPointForm, setShowPointForm] = useState(false);
  const [pf, setPf] = useState({ title_en: '', title_ar: '', pattern: '', explanation_en: '', explanation_ar: '', usage_en: '', usage_ar: '' });
  const [showExForm, setShowExForm] = useState(false);
  const [ef, setEf] = useState({ type: 'fill_blank' as GrammarExerciseType, prompt_en: '', prompt_ar: '', chinese: '', options: '', correct: '', correct_pinyin: '' });

  const loadGrammar = useCallback(async (lid: string) => {
    if (!lid) return;
    setError(null);
    try {
      const { data: p, error: pe } = await supabase.from('grammar_points').select('*').eq('lesson_id', lid).order('order_num');
      if (pe) { setTableMissing(true); return; }
      setTableMissing(false);
      setPoints(p || []);
      const { data: e } = await supabase.from('grammar_exercises').select('*').eq('lesson_id', lid).order('order_num');
      setExercises(e || []);
    } catch {
      setTableMissing(true);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const ls = await fetchLessons();
        setLessons(ls);
        if (ls.length > 0) {
          setLessonId(ls[0].id);
          await loadGrammar(ls[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadGrammar]);

  const onLessonChange = async (lid: string) => {
    setLessonId(lid);
    await loadGrammar(lid);
  };

  const writeError = (e: { message?: string } | null) => {
    if (!e) return;
    const msg = e.message || 'write failed';
    if (/policy|permission|denied|violates row-level/i.test(msg)) {
      setError('Write blocked by RLS. Run supabase/optional-grammar-admin-write.sql once (gives admins insert/update/delete on the grammar tables).');
    } else {
      setError(msg);
    }
  };

  const addPoint = async () => {
    if (!pf.title_en || !pf.pattern) return;
    setSaving(true);
    setError(null);
    const { error: e } = await supabase.from('grammar_points').insert({
      lesson_id: lessonId,
      order_num: points.length + 1,
      title_en: pf.title_en, title_ar: pf.title_ar || pf.title_en,
      pattern: pf.pattern,
      explanation_en: pf.explanation_en, explanation_ar: pf.explanation_ar || pf.explanation_en,
      usage_en: pf.usage_en, usage_ar: pf.usage_ar || pf.usage_en,
      examples: [], common_mistakes: [],
    });
    setSaving(false);
    if (e) { writeError(e); return; }
    setPf({ title_en: '', title_ar: '', pattern: '', explanation_en: '', explanation_ar: '', usage_en: '', usage_ar: '' });
    setShowPointForm(false);
    await loadGrammar(lessonId);
  };

  const addExercise = async () => {
    if (!ef.prompt_en || !ef.correct) return;
    setSaving(true);
    setError(null);
    const opts = ef.options.split('/').map(s => s.trim()).filter(Boolean);
    const { error: e } = await supabase.from('grammar_exercises').insert({
      lesson_id: lessonId,
      order_num: exercises.length + 1,
      type: ef.type,
      prompt_en: ef.prompt_en, prompt_ar: ef.prompt_ar || ef.prompt_en,
      chinese: ef.chinese || null,
      words: ef.type === 'word_order' ? opts : null,
      options: ef.type !== 'word_order' && ef.type !== 'type_pinyin' ? opts : null,
      correct: ef.correct,
      correct_pinyin: ef.correct_pinyin || null,
    });
    setSaving(false);
    if (e) { writeError(e); return; }
    setEf({ type: 'fill_blank', prompt_en: '', prompt_ar: '', chinese: '', options: '', correct: '', correct_pinyin: '' });
    setShowExForm(false);
    await loadGrammar(lessonId);
  };

  const deleteRow = async (table: 'grammar_points' | 'grammar_exercises', id: string) => {
    setError(null);
    const { error: e } = await supabase.from(table).delete().eq('id', id);
    if (e) { writeError(e); return; }
    await loadGrammar(lessonId);
  };

  const input = 'w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#FF3333]/50 outline-none';

  if (loading) {
    return <div className="text-white flex items-center gap-2 py-8"><Loader2 className="animate-spin" size={18} /> Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <BookMarked size={18} className="text-[#FF3333]" />
        <h2 className="font-display font-bold text-lg text-white">Grammar Manager</h2>
      </div>

      <select value={lessonId} onChange={e => onLessonChange(e.target.value)} className={input + ' max-w-md mb-5'}>
        {lessons.map(l => <option key={l.id} value={l.id}>{l.order_num}. {l.title_en}</option>)}
      </select>

      {tableMissing && (
        <div className="liquid-glass p-4 mb-5 border border-[#f59e0b]/30 text-sm flex items-start gap-2" style={{ color: '#f59e0b' }}>
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>Grammar tables not installed. Run <code className="text-white">supabase/optional-grammar.sql</code> in the Supabase SQL editor first. (The learner Grammar tab keeps working from built-in content meanwhile.)</span>
        </div>
      )}

      {error && (
        <div className="liquid-glass p-4 mb-5 border border-[#FF3333]/30 text-sm text-[#FF3333]">{error}</div>
      )}

      {!tableMissing && (
        <>
          {/* Points */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white text-sm">Grammar points ({points.length})</h3>
            <button onClick={() => setShowPointForm(v => !v)} className="btn-secondary text-xs py-1.5 px-3"><Plus size={12} /> Add point</button>
          </div>
          {showPointForm && (
            <div className="liquid-glass p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={input} placeholder="Title EN *" value={pf.title_en} onChange={e => setPf({ ...pf, title_en: e.target.value })} />
              <input className={input} placeholder="العنوان AR" dir="rtl" value={pf.title_ar} onChange={e => setPf({ ...pf, title_ar: e.target.value })} />
              <input className={input + ' sm:col-span-2'} placeholder="Pattern * (e.g. A + 是 + B)" value={pf.pattern} onChange={e => setPf({ ...pf, pattern: e.target.value })} />
              <textarea className={input} rows={2} placeholder="Explanation EN" value={pf.explanation_en} onChange={e => setPf({ ...pf, explanation_en: e.target.value })} />
              <textarea className={input} rows={2} dir="rtl" placeholder="الشرح AR" value={pf.explanation_ar} onChange={e => setPf({ ...pf, explanation_ar: e.target.value })} />
              <input className={input} placeholder="When to use EN" value={pf.usage_en} onChange={e => setPf({ ...pf, usage_en: e.target.value })} />
              <input className={input} dir="rtl" placeholder="متى تستخدم AR" value={pf.usage_ar} onChange={e => setPf({ ...pf, usage_ar: e.target.value })} />
              <button onClick={addPoint} disabled={saving || !pf.title_en || !pf.pattern} className="btn-primary text-xs py-2 px-4 sm:col-span-2 disabled:opacity-40">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save point
              </button>
            </div>
          )}
          <div className="space-y-2 mb-7">
            {points.length === 0 && <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>No database grammar points for this lesson (lessons 1–15 show built-in fallback content to learners).</p>}
            {points.map(p => (
              <div key={p.id} className="liquid-glass p-3 flex items-center gap-3">
                <span className="text-xs text-[#888] w-6">{p.order_num}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.title_en}</p>
                  <p className="text-xs text-[#FF3333] font-chinese">{p.pattern}</p>
                </div>
                <button onClick={() => deleteRow('grammar_points', p.id)} className="text-[#FF3333] hover:bg-[#FF3333]/10 p-2 rounded-lg"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Exercises */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white text-sm">Exercises ({exercises.length})</h3>
            <button onClick={() => setShowExForm(v => !v)} className="btn-secondary text-xs py-1.5 px-3"><Plus size={12} /> Add exercise</button>
          </div>
          {showExForm && (
            <div className="liquid-glass p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select className={input} value={ef.type} onChange={e => setEf({ ...ef, type: e.target.value as GrammarExerciseType })}>
                {(['fill_blank','word_order','formal_casual','transform_question','transform_negative','dialogue','context_choice','choose_pinyin','tone_choice','type_pinyin'] as GrammarExerciseType[]).map(tp => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
              <input className={input} placeholder="Chinese stem (optional)" value={ef.chinese} onChange={e => setEf({ ...ef, chinese: e.target.value })} />
              <input className={input} placeholder="Prompt EN *" value={ef.prompt_en} onChange={e => setEf({ ...ef, prompt_en: e.target.value })} />
              <input className={input} dir="rtl" placeholder="السؤال AR" value={ef.prompt_ar} onChange={e => setEf({ ...ef, prompt_ar: e.target.value })} />
              <input className={input} placeholder="Options / words, separated by / (e.g. 是/在/有)" value={ef.options} onChange={e => setEf({ ...ef, options: e.target.value })} />
              <input className={input} placeholder="Correct answer *" value={ef.correct} onChange={e => setEf({ ...ef, correct: e.target.value })} />
              <input className={input} placeholder="Correct answer pinyin (optional)" value={ef.correct_pinyin} onChange={e => setEf({ ...ef, correct_pinyin: e.target.value })} />
              <button onClick={addExercise} disabled={saving || !ef.prompt_en || !ef.correct} className="btn-primary text-xs py-2 px-4 disabled:opacity-40">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save exercise
              </button>
            </div>
          )}
          <div className="space-y-2">
            {exercises.map(e => (
              <div key={e.id} className="liquid-glass p-3 flex items-center gap-3">
                <span className="text-[10px] uppercase px-2 py-1 rounded bg-white/[0.06] text-[#aaa] shrink-0">{e.type}</span>
                <p className="flex-1 text-sm text-white truncate">{e.prompt_en}</p>
                <button onClick={() => deleteRow('grammar_exercises', e.id)} className="text-[#FF3333] hover:bg-[#FF3333]/10 p-2 rounded-lg"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
