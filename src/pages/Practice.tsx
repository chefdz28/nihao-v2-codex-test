import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Headphones, BookOpen, Loader2, Music4, BookOpenCheck, Music2, Hash, MessagesSquare, Map, Mic, RotateCcw, Sun, Target, BookA, Award, ClipboardCheck, BookOpenText, GraduationCap, FileText, NotebookPen, School, ClipboardList, FileBarChart, Layers } from 'lucide-react';
import StartHere from '@/components/StartHere';
import { useI18n } from '@/i18n';
import { fetchLessons, fetchVocabulary, fetchSentences } from '@/lib/dataService';
import WritingPad from '@/components/WritingPad';
import ListeningPractice from '@/components/ListeningPractice';
import FlashcardDeck from '@/components/FlashcardDeck';
import type { LessonRow, VocabRow, SentenceRow } from '@/types/supabase';

/**
 * V2 Practice hub: now loads real Supabase lesson content (previously static
 * demo data) and reuses the shared Writing / Listening / Flashcards modules.
 */
export default function Practice() {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'writing' | 'listening' | 'flashcards'>('writing');
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLessons();
        setLessons(data);
        if (data.length > 0) setSelectedLesson(data[0].id);
      } catch (err) {
        console.error('Practice lessons load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedLesson) return;
    let cancelled = false;
    async function loadContent() {
      setLoadingContent(true);
      try {
        const [v, s] = await Promise.all([fetchVocabulary(selectedLesson), fetchSentences(selectedLesson)]);
        if (!cancelled) { setVocab(v); setSentences(s); }
      } catch (err) {
        console.error('Practice content load error:', err);
        if (!cancelled) { setVocab([]); setSentences([]); }
      } finally {
        if (!cancelled) setLoadingContent(false);
      }
    }
    loadContent();
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
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <motion.h1 className="font-display font-black text-4xl text-white mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {t('nav.practice')}
      </motion.h1>

      {/* V2.1: pinyin-first beginner flow */}
      <div className="mb-8"><StartHere compact /></div>

      {/* V2.0.6: quick access to every learning tool */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        {[
          { path: '/pinyin', label: 'nav.pinyin', icon: Music4 },
          { path: '/essentials', label: 'nav.essentials', icon: BookOpenCheck },
          { path: '/tones', label: 'nav.tones', icon: Music2 },
          { path: '/numbers', label: 'nav.numbers', icon: Hash },
          { path: '/dialogues', label: 'nav.dialogues', icon: MessagesSquare },
          { path: '/path', label: 'nav.path', icon: Map },
          { path: '/pronunciation', label: 'nav.pronunciation', icon: Mic },
          { path: '/review', label: 'nav.review', icon: RotateCcw },
          { path: '/daily', label: 'nav.daily', icon: Sun },
          { path: '/missions', label: 'nav.missions', icon: Target },
          { path: '/placement-test', label: 'nav.placement', icon: ClipboardCheck },
          { path: '/dictionary', label: 'nav.dictionary', icon: BookA },
          { path: '/achievements', label: 'nav.achievements', icon: Award },
          { path: '/stories', label: 'nav.stories', icon: BookOpenText },
          { path: '/worksheets', label: 'nav.worksheets', icon: FileText },
          { path: '/certificates', label: 'nav.certificates', icon: GraduationCap },
          { path: '/mistakes', label: 'nav.mistakes', icon: NotebookPen },
          { path: '/hsk1-simulation', label: 'nav.hsk1', icon: ClipboardList },
          { path: '/teacher', label: 'nav.teacher', icon: School },
          { path: '/dictation', label: 'nav.dictation', icon: Headphones },
          { path: '/flashcards-print', label: 'nav.flashcardsPrint', icon: Layers },
          { path: '/report', label: 'nav.report', icon: FileBarChart },
        ].map(card => (
          <Link
            key={card.path}
            to={card.path}
            className="liquid-glass p-4 text-center rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors group"
          >
            <card.icon size={22} className="mx-auto mb-2 text-[#FF3333] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-display font-semibold text-white block">{t(card.label)}</span>
          </Link>
        ))}
      </div>

      {/* Lesson selector */}
      <div className="mb-6">
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

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {[
          { key: 'writing' as const, label: t('lesson.tab.writing'), icon: PenTool },
          { key: 'listening' as const, label: t('lesson.tab.listening'), icon: Headphones },
          { key: 'flashcards' as const, label: t('lesson.tab.flashcards'), icon: BookOpen },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-display font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loadingContent ? (
        <div className="text-center py-12 text-white flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> {t('common.loading')}</div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'writing' && (
            <motion.div key={'writing-' + selectedLesson} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <WritingPad vocabulary={vocab} />
            </motion.div>
          )}
          {activeTab === 'listening' && (
            <motion.div key={'listening-' + selectedLesson} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ListeningPractice vocabulary={vocab} sentences={sentences} />
            </motion.div>
          )}
          {activeTab === 'flashcards' && (
            <motion.div key={'flashcards-' + selectedLesson} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FlashcardDeck key={selectedLesson} vocabulary={vocab} srsDeck={selectedLesson} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
