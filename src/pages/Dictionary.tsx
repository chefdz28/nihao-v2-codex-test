import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookA, Search, Volume2, Star, Loader2, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import { fetchVocabulary, fetchSentences } from '@/lib/dataService';
import { stripTones } from '@/lib/pinyin';
import { trackActivity } from '@/lib/gamification';

const SAVED_KEY = 'nihao_saved_words_v1';
function loadSaved(): string[] { try { return JSON.parse(window.localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; } }
import { hsk1FullLessons } from '@/data/hsk1-full';
import type { VocabRow, SentenceRow } from '@/types/supabase';
import { dictionaryWords, dictionaryCategories } from '@/data/dictionaryCore';

interface DictEntry { id: string; chinese: string; pinyin: string; arabic: string; english: string; lesson_id?: string }

/** deterministic word-of-the-day index by date */
function wotdIndex(len: number): number {
  const d = new Date();
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  return len > 0 ? seed % len : 0;
}

/** V2.1 /dictionary — search the existing vocabulary (zh/pinyin/AR/EN) + Word of the Day. */
export default function Dictionary() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const saved = loadSaved();
  const [hskFilter, setHskFilter] = useState<0 | 1 | 2>(0);   // 0 = all
  const [catFilter, setCatFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const [vocab, sents] = await Promise.all([
          fetchVocabulary() as Promise<VocabRow[]>,
          fetchSentences() as Promise<SentenceRow[]>,
        ]);
        if (vocab && vocab.length > 0) {
          setEntries(vocab.map(v => ({ id: v.id, chinese: v.chinese, pinyin: v.pinyin, arabic: v.arabic, english: v.english, lesson_id: v.lesson_id })));
          setSentences(sents || []);
          return;
        }
        throw new Error('empty');
      } catch {
        // fallback: built-in HSK1 lesson data
        const fb: DictEntry[] = hsk1FullLessons.flatMap(l => l.vocabulary.map(v => ({
          id: v.id, chinese: v.chinese, pinyin: v.pinyin, arabic: v.arabic, english: v.english || '',
        })));
        setEntries(fb);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const wotd = entries.length > 0 ? entries[wotdIndex(entries.length)] : null;
  const wotdSentence = wotd ? sentences.find(s => s.chinese.includes(wotd.chinese)) : null;

  // V2.8A: browse the canonical dictionary with HSK + category filters
  const browse = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qStripped = stripTones(q);
    return dictionaryWords.filter(w => {
      if (hskFilter !== 0 && w.hsk !== hskFilter) return false;
      if (catFilter !== 'all' && w.category !== catFilter) return false;
      if (!q) return true;
      return w.chinese.includes(query.trim())
        || stripTones(w.pinyin.toLowerCase()).includes(qStripped)
        || w.arabic.includes(query.trim())
        || (w.english || '').toLowerCase().includes(q);
    });
  }, [query, hskFilter, catFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <BookA className="text-[#FF3333]" /> {t('dict.title')}
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('dict.subtitle')} ({entries.length} {t('dict.words')})
        </p>
      </motion.div>

      {/* Word of the day */}
      {wotd && !query && (
        <div className="liquid-glass p-6 mb-6 border border-[#f59e0b]/25 rounded-2xl">
          <p className="text-xs font-display font-semibold uppercase mb-3 flex items-center gap-2 text-[#f59e0b]">
            <Sparkles size={14} /> {t('dict.wotd')}
          </p>
          <div className="flex items-start gap-4">
            <span className="font-chinese text-5xl text-white">{wotd.chinese}</span>
            <div className="flex-1 min-w-0">
              <PinyinText size="lg">{wotd.pinyin}</PinyinText>
              <p className={`text-sm text-white font-arabic`} dir="rtl">{wotd.arabic}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{wotd.english}</p>
            </div>
            <button onClick={() => { play(wotd.chinese); trackActivity('words_seen'); }} className="w-10 h-10 rounded-full bg-[#FF3333] hover:bg-[#ff5555] flex items-center justify-center shrink-0 transition-colors">
              <Volume2 size={16} className="text-white" />
            </button>
          </div>
          {wotdSentence && (
            <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/5 p-3">
              <p className="font-chinese text-lg text-white">{wotdSentence.chinese}</p>
              <PinyinText>{wotdSentence.pinyin}</PinyinText>
              <p className="text-xs font-arabic" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{wotdSentence.arabic}</p>
            </div>
          )}
          <div className="mt-4">
            <Link to="/flashcards" className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              <Star size={12} /> {t('dict.quickQuiz')}
            </Link>
          </div>
        </div>
      )}

      {/* Saved words */}
      {!query && saved.length > 0 && (
        <div className="liquid-glass p-4 mb-6">
          <p className="text-xs font-display font-semibold uppercase mb-3 text-[#f59e0b]">⭐ {t('dict.saved')} ({saved.length})</p>
          <div className="flex flex-wrap gap-2">
            {entries.filter(e => saved.includes(e.id)).slice(0, 20).map(e => (
              <button key={e.id} onClick={() => play(e.chinese)} className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-center hover:border-[#FF3333]/40 transition-colors">
                <span className="font-chinese text-lg text-white block">{e.chinese}</span>
                <PinyinText className="text-center">{e.pinyin}</PinyinText>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={17} className="absolute top-1/2 -translate-y-1/2 start-4 text-[#666]" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('dict.placeholder')}
          className="w-full bg-[#161616] border border-white/10 rounded-2xl ps-12 pe-4 py-4 text-white text-base focus:border-[#FF3333]/50 outline-none"
        />
      </div>

      {/* V2.8A: HSK + category filters */}
      <div className="flex flex-wrap gap-2 mb-4" dir="rtl">
        <div className="flex gap-1 liquid-glass rounded-xl p-1">
          {([0, 1, 2] as const).map(h => (
            <button key={h} onClick={() => setHskFilter(h)} className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors ${hskFilter === h ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] hover:text-white'}`}>
              {h === 0 ? 'الكل' : `HSK${h}`}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-arabic">
          <option value="all">كل التصنيفات</option>
          {dictionaryCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs flex items-center px-2 font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>{browse.length} كلمة</span>
      </div>

      {/* V2.8A: browse grid — each card links to its word page */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8" dir="rtl">
        {browse.slice(0, 120).map(w => (
          <Link key={w.slug} to={`/dictionary/${w.slug}`} className="liquid-glass rounded-2xl p-4 text-center hover:border-[#FF3333]/30 border border-transparent transition-colors">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF3333]/15 text-[#FF3333] font-display font-bold inline-block mb-1">HSK{w.hsk}</span>
            <span className="font-chinese text-3xl text-white block mb-1">{w.chinese}</span>
            <PinyinText className="text-center">{w.pinyin}</PinyinText>
            <span className="text-xs font-arabic text-white block mt-1">{w.arabic}</span>
          </Link>
        ))}
        {browse.length === 0 && (
          <p className="col-span-full text-center py-10 text-sm font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>لا توجد كلمات مطابقة.</p>
        )}
      </div>
    </div>
  );
}
