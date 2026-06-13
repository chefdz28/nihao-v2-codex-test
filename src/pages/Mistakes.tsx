import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NotebookPen, Check, RotateCcw, Trash2, Volume2, Eye } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import { getMistakes, bumpReview, setMastered, clearMastered, type MistakeSource } from '@/lib/mistakes';
import { awardDailyXP } from '@/lib/gamification';

const SOURCES: { key: MistakeSource | 'all'; labelKey: string }[] = [
  { key: 'all', labelKey: 'mist.all' },
  { key: 'quiz', labelKey: 'mist.quiz' },
  { key: 'story', labelKey: 'mist.story' },
  { key: 'grammar', labelKey: 'mist.grammar' },
  { key: 'placement', labelKey: 'mist.placement' },
  { key: 'hsk1', labelKey: 'mist.hsk1' },
];

/** V2.2.1 /mistakes — automatic mistake notebook with review mode */
export default function Mistakes() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<MistakeSource | 'all'>('all');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  void tick;

  const all = getMistakes();
  const list = (filter === 'all' ? all : all.filter(m => m.source === filter))
    .sort((a, b) => Number(a.mastered) - Number(b.mastered) || b.date.localeCompare(a.date));

  const reveal = (id: string) => {
    if (revealed.has(id)) return;
    setRevealed(prev => new Set(prev).add(id));
    bumpReview(id);
    awardDailyXP(`mist_review:${id}`, 2); // small XP per mistake reviewed, daily-scoped
    setTick(x => x + 1);
  };

  const master = (id: string, v: boolean) => { setMastered(id, v); setTick(x => x + 1); };
  const clean = () => { clearMastered(); setTick(x => x + 1); };

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <NotebookPen className="text-[#FF3333]" /> {t('mist.title')}
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('mist.subtitle')}
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {SOURCES.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`px-3 py-2 rounded-xl text-xs font-display font-semibold transition-all ${filter === s.key ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>
            {t(s.labelKey)}
          </button>
        ))}
        {all.some(m => m.mastered) && (
          <button onClick={clean} className="ms-auto btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
            <Trash2 size={12} /> {t('mist.clearMastered')}
          </button>
        )}
      </div>

      {list.length === 0 && (
        <div className="liquid-glass p-10 text-center">
          <span className="text-4xl block mb-3">🎉</span>
          <p className={`text-sm ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-secondary)' }}>{t('mist.empty')}</p>
        </div>
      )}

      <div className="space-y-3">
        {list.map(m => {
          const isRevealed = revealed.has(m.id);
          return (
            <div key={m.id} className={`liquid-glass p-4 rounded-2xl border ${m.mastered ? 'border-[#10b981]/25 opacity-60' : 'border-white/5'}`}>
              <div className="flex items-center gap-2 mb-2 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                <span className="px-2 py-0.5 rounded-full bg-white/5 uppercase">{t(`mist.${m.source}`)}</span>
                <span>{m.date}</span>
                <span>· {t('mist.reviewed')} {m.reviewCount}×</span>
              </div>
              <p className={`text-sm text-white mb-1 ${isAr ? 'font-arabic' : ''}`} dir="auto">{m.question}</p>
              {m.chinese && (
                <div className="flex items-center gap-2 my-1">
                  <span className="font-chinese text-xl text-white">{m.chinese}</span>
                  <button onClick={() => play(m.chinese!)} className="text-[#888] hover:text-white"><Volume2 size={13} /></button>
                </div>
              )}
              {!isRevealed ? (
                <button onClick={() => reveal(m.id)} className="btn-secondary text-xs py-1.5 px-3 mt-1 flex items-center gap-1.5">
                  <Eye size={12} /> {t('mist.showAnswer')} <span className="text-[#f59e0b]">+2 XP</span>
                </button>
              ) : (
                <div className="mt-2 rounded-xl bg-white/[0.02] border border-white/5 p-3">
                  <p className="text-xs"><span className="text-[#FF3333]">✗ {t('mist.you')}:</span> <span className="text-white font-chinese">{m.yourAnswer}</span></p>
                  <p className="text-xs mt-1"><span className="text-[#10b981]">✓ {t('mist.correct')}:</span> <span className="text-white font-chinese">{m.correctAnswer}</span></p>
                  {m.pinyin && <PinyinText className="mt-1">{m.pinyin}</PinyinText>}
                  {(isAr ? m.explain_ar : m.explain_en) && (
                    <p className={`text-xs mt-1 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
                      {isAr ? m.explain_ar : m.explain_en}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Link to={m.link} className="btn-secondary text-[11px] py-1.5 px-3">{t('mist.goPractice')}</Link>
                    {!m.mastered ? (
                      <button onClick={() => master(m.id, true)} className="btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1"><Check size={11} /> {t('mist.master')}</button>
                    ) : (
                      <button onClick={() => master(m.id, false)} className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"><RotateCcw size={11} /> {t('mist.unmaster')}</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
