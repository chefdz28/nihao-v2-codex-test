import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { fetchLessons, fetchVocabulary } from '@/lib/dataService';
import FlashcardDeck from '@/components/FlashcardDeck';
import type { LessonRow, VocabRow } from '@/types/supabase';

/** V2: standalone /flashcards page — pick a lesson, study its deck. */
export default function Flashcards() {
  const { t, lang } = useI18n();
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVocab, setLoadingVocab] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLessons();
        setLessons(data);
        if (data.length > 0) setSelectedLesson(data[0].id);
      } catch (err) {
        console.error('Flashcards lessons load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedLesson) return;
    let cancelled = false;
    async function loadVocab() {
      setLoadingVocab(true);
      try {
        const data = await fetchVocabulary(selectedLesson);
        if (!cancelled) setVocab(data);
      } catch (err) {
        console.error('Flashcards vocab load error:', err);
        if (!cancelled) setVocab([]);
      } finally {
        if (!cancelled) setLoadingVocab(false);
      }
    }
    loadVocab();
    return () => { cancelled = true; };
  }, [selectedLesson]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Layers className="text-[#FF3333]" /> {t('flashcards.title')}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>{t('flashcards.subtitle')}</p>
      </motion.div>

      {/* Lesson selector */}
      <div className="mb-8">
        <label className="block text-xs mb-2 font-display font-semibold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
          {t('flashcards.selectLesson')}
        </label>
        <select
          value={selectedLesson}
          onChange={e => setSelectedLesson(e.target.value)}
          className="w-full sm:w-auto min-w-[280px] bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#FF3333]/50 outline-none"
        >
          {lessons.map(l => (
            <option key={l.id} value={l.id}>
              {l.order_num}. {lang === 'ar' ? l.title_ar : l.title_en}
            </option>
          ))}
        </select>
      </div>

      {loadingVocab ? (
        <div className="text-center py-12 text-white flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> {t('common.loading')}</div>
      ) : (
        <FlashcardDeck key={selectedLesson} vocabulary={vocab} />
      )}
    </div>
  );
}
