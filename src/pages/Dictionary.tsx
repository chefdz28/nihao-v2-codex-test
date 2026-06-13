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
function toggleSaved(id: string): string[] {
  const cur = loadSaved();
  const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
  try { window.localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* private mode */ }
  return next;
}
import { hsk1FullLessons } from '@/data/hsk1-full';
import type { VocabRow, SentenceRow } from '@/types/supabase';

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
  const [saved, setSaved] = useState<string[]>(loadSaved());

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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qStripped = stripTones(q);
    return entries.filter(e =>
      e.chinese.includes(query.trim()) ||
      stripTones(e.pinyin.toLowerCase()).includes(qStripped) ||
      e.arabic.includes(query.trim()) ||
      (e.english || '').toLowerCase().includes(q),
    ).slice(0, 40);
  }, [query, entries]);

  const wotd = entries.length > 0 ? entries[wotdIndex(entries.length)] : null;
  const wotdSentence = wotd ? sentences.find(s => s.chinese.includes(wotd.chinese)) : null;

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

      {query && (
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
          {results.length} {t('dict.results')}
        </p>
      )}

      <div className="space-y-2">
        {results.map(e => (
          <div key={e.id} className="liquid-glass p-4 flex items-center gap-4">
            <span className="font-chinese text-2xl text-white w-20 shrink-0">{e.chinese}</span>
            <div className="flex-1 min-w-0">
              <PinyinText size="base">{e.pinyin}</PinyinText>
              <p className="text-sm font-arabic text-white" dir="rtl">{e.arabic}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{e.english}</p>
            </div>
            <button onClick={() => setSaved(toggleSaved(e.id))} aria-label="save"
              className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors ${saved.includes(e.id) ? 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]' : 'bg-white/5 border-white/10 text-[#888] hover:text-white'}`}>
              <Star size={14} />
            </button>
            <button onClick={() => { play(e.chinese); trackActivity('words_seen'); }} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF3333]/40 flex items-center justify-center shrink-0 transition-colors">
              <Volume2 size={14} className="text-white" />
            </button>
          </div>
        ))}
        {query && results.length === 0 && (
          <p className={`text-center py-10 text-sm ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{t('dict.empty')}</p>
        )}
      </div>
    </div>
  );
}
