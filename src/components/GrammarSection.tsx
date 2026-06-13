import { useState, useEffect } from 'react';
import { trackActivity } from '@/lib/gamification';
import { Loader2, BookMarked, Dumbbell, Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/i18n';
import { fetchLessonGrammar } from '@/lib/grammarService';
import GrammarExplanation from '@/components/GrammarExplanation';
import GrammarExerciseCard from '@/components/GrammarExerciseCard';
import SentenceBuilderExercise from '@/components/SentenceBuilderExercise';
import TypePinyinExercise from '@/components/TypePinyinExercise';
import MatchingExercise from '@/components/MatchingExercise';
import type { LessonGrammar } from '@/types/grammar';

interface GrammarSectionProps {
  lessonId: string;
  lessonOrderNum: number;
}

/**
 * V2.0.3: the lesson Grammar tab — loads grammar points + exercises
 * (database first, built-in fallback for lessons 1–15 second), shows the
 * explanations, then the practice list with a local progress counter.
 * No new progress tables required.
 */
export default function GrammarSection({ lessonId, lessonOrderNum }: GrammarSectionProps) {
  const { t } = useI18n();
  const [data, setData] = useState<LessonGrammar | null>(null);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [showPinyin, setShowPinyin] = useState(true); // V2.0.4: default ON for beginners

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await fetchLessonGrammar(lessonId, lessonOrderNum);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData({ points: [], exercises: [], source: 'empty' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [lessonId, lessonOrderNum]);

  if (loading) {
    return (
      <div className="text-center py-12 text-white flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={18} /> {t('common.loading')}
      </div>
    );
  }

  if (!data || data.points.length === 0) {
    return (
      <div className="liquid-glass p-10 text-center">
        <BookMarked size={36} className="mx-auto mb-3 text-[#666]" />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('grammar.empty')}</p>
      </div>
    );
  }

  const correctCount = Object.values(answered).filter(Boolean).length;
  const doneCount = Object.keys(answered).length;

  const recordResult = (id: string) => (correct: boolean) => {
    if (!(id in answered)) trackActivity('grammar_done');
    // first answer counts; retries don't change the recorded result
    setAnswered(prev => (id in prev ? prev : { ...prev, [id]: correct }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* V2.0.4: Show/Hide pinyin toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowPinyin(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-semibold transition-all ${showPinyin ? 'bg-[#FF3333]/15 text-[#FF3333] border border-[#FF3333]/30' : 'liquid-glass text-[#a0a0a0] border border-white/10'}`}
        >
          {showPinyin ? <Eye size={14} /> : <EyeOff size={14} />}
          {showPinyin ? t('pinyin.hide') : t('pinyin.show')}
        </button>
      </div>

      {/* Grammar points */}
      {data.points.map(point => (
        <GrammarExplanation key={point.id} point={point} showPinyin={showPinyin} />
      ))}

      {/* Practice */}
      {data.exercises.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Dumbbell size={18} className="text-[#FF3333]" /> {t('grammar.practice')}
            </h3>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('grammar.score')}: {correctCount} / {doneCount > 0 ? data.exercises.length : data.exercises.length}
              {doneCount > 0 && ` · ${t('grammar.answered')}: ${doneCount}`}
            </span>
          </div>
          <div className="space-y-4">
            {data.exercises.map(ex => (
              <div key={ex.id} className="liquid-glass p-5">
                {ex.type === 'word_order' ? (
                  <SentenceBuilderExercise exercise={ex} showPinyin={showPinyin} onResult={recordResult(ex.id)} />
                ) : ex.type === 'type_pinyin' ? (
                  <TypePinyinExercise
                    chinese={ex.chinese || ''}
                    expected={ex.correct}
                    promptEn={ex.prompt_en}
                    promptAr={ex.prompt_ar}
                    onResult={recordResult(ex.id)}
                  />
                ) : (ex.type === 'match_zh_pinyin' || ex.type === 'match_pinyin_meaning') && ex.pairs ? (
                  <MatchingExercise
                    pairs={ex.pairs}
                    leftIsChinese={ex.type === 'match_zh_pinyin'}
                    promptEn={ex.prompt_en}
                    promptAr={ex.prompt_ar}
                    onResult={recordResult(ex.id)}
                  />
                ) : (
                  <GrammarExerciseCard exercise={ex} showPinyin={showPinyin} onResult={recordResult(ex.id)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
