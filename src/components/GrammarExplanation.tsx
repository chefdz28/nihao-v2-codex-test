import { BookMarked, Lightbulb, Scale, AlertTriangle } from 'lucide-react';
import PinyinText from '@/components/PinyinText';
import { useI18n } from '@/i18n';
import AudioButton from '@/components/AudioButton';
import type { GrammarPoint } from '@/types/grammar';

/**
 * V2.0.3: renders one grammar point — pattern, bilingual explanation,
 * when-to-use, formal/casual note, examples (with TTS) and common mistakes.
 */
export default function GrammarExplanation({ point, showPinyin = true }: { point: GrammarPoint; showPinyin?: boolean }) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <div className="liquid-glass p-6 mb-5">
      {/* Title + pattern */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#FF3333]/15 flex items-center justify-center shrink-0">
          <BookMarked size={18} className="text-[#FF3333]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg text-white">{isAr ? point.title_ar : point.title_en}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? point.title_en : point.title_ar}</p>
        </div>
      </div>

      <div className="inline-block px-4 py-2 rounded-xl bg-[#FF3333]/10 border border-[#FF3333]/25 mb-4">
        <span className="text-xs uppercase font-display font-semibold mr-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('grammar.pattern')}</span>
        <span className="font-chinese text-base text-white">{point.pattern}</span>
      </div>

      {/* Explanation (both languages, user's language first) */}
      <p className={`text-sm leading-relaxed mb-2 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
        {isAr ? point.explanation_ar : point.explanation_en}
      </p>
      <p className={`text-xs leading-relaxed mb-4 ${isAr ? '' : 'font-arabic'}`} dir={isAr ? 'ltr' : 'rtl'} style={{ color: 'var(--color-text-tertiary)' }}>
        {isAr ? point.explanation_en : point.explanation_ar}
      </p>

      {/* When to use */}
      <div className="flex gap-2 items-start rounded-xl bg-white/[0.03] border border-white/5 p-3 mb-3">
        <Lightbulb size={15} className="text-[#f59e0b] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-display font-semibold uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{t('grammar.whenToUse')}</p>
          <p className={`text-sm ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
            {isAr ? point.usage_ar : point.usage_en}
          </p>
        </div>
      </div>

      {/* Formal vs casual */}
      {(point.formal_note_en || point.formal_note_ar) && (
        <div className="flex gap-2 items-start rounded-xl bg-white/[0.03] border border-white/5 p-3 mb-4">
          <Scale size={15} className="text-[#3b82f6] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-display font-semibold uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{t('grammar.formalCasual')}</p>
            <p className={`text-sm ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
              {isAr ? point.formal_note_ar : point.formal_note_en}
            </p>
          </div>
        </div>
      )}

      {/* Examples */}
      <p className="text-xs font-display font-semibold uppercase mb-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('grammar.examples')}</p>
      <div className="space-y-2 mb-4">
        {point.examples.map((ex, i) => (
          <div key={i} className="rounded-xl bg-white/[0.02] border border-white/5 p-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-chinese text-lg text-white">{ex.chinese}</p>
              {showPinyin && <PinyinText size="base">{ex.pinyin}</PinyinText>}
              <p className="text-xs font-arabic" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{ex.arabic}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{ex.english}</p>
            </div>
            <AudioButton text={ex.chinese.replace(/^A: |B: /g, '').replace(' B: ', '。')} size="sm" />
          </div>
        ))}
      </div>

      {/* Common mistakes */}
      {point.common_mistakes.length > 0 && (
        <>
          <p className="text-xs font-display font-semibold uppercase mb-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('grammar.commonMistakes')}</p>
          <div className="space-y-2">
            {point.common_mistakes.map((m, i) => (
              <div key={i} className="rounded-xl bg-[#FF3333]/5 border border-[#FF3333]/20 p-3">
                <div className="flex flex-wrap items-start gap-2 text-sm mb-1">
                  <AlertTriangle size={13} className="text-[#FF3333] shrink-0 mt-1.5" />
                  <span className="inline-flex flex-col">
                    <span className="font-chinese line-through text-[#FF3333]">{m.wrong}</span>
                    {showPinyin && m.wrong_pinyin && <PinyinText muted className="no-underline">{m.wrong_pinyin}</PinyinText>}
                  </span>
                  <span className="mt-1" style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                  <span className="inline-flex flex-col">
                    <span className="font-chinese text-[#10b981]">{m.right}</span>
                    {showPinyin && m.right_pinyin && <PinyinText className="!text-[#10b981]">{m.right_pinyin}</PinyinText>}
                  </span>
                </div>
                <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
                  {isAr ? m.note_ar : m.note_en}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
