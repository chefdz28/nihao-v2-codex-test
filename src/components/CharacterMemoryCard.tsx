import { Sparkles } from 'lucide-react';
import PinyinText from '@/components/PinyinText';
import { useI18n } from '@/i18n';
import AudioButton from '@/components/AudioButton';
import type { HanziMemory } from '@/data/hanziMemory';
import { hanziParts, hanziEvolution } from '@/data/hanziExtra';

/**
 * V2.0.4 "Remember the Character" card: character, pinyin, meaning, a simple
 * visual memory story, components/stroke hints, example word and sentence.
 */
export default function CharacterMemoryCard({ item, compact = false }: { item: HanziMemory; compact?: boolean }) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <div className="liquid-glass p-5">
      <div className="flex items-start gap-4 mb-3">
        <span className="font-chinese text-5xl text-white leading-none">{item.char}</span>
        <div className="min-w-0 flex-1">
          <PinyinText size="lg">{item.pinyin}</PinyinText>
          <p className="text-sm text-white">{isAr ? item.meaning_ar : item.meaning_en}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? item.meaning_en : item.meaning_ar}</p>
        </div>
        <AudioButton text={item.char} size="sm" />
      </div>

      <div className="flex gap-2 items-start rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/20 p-3 mb-3">
        <Sparkles size={14} className="text-[#f59e0b] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-[10px] font-display font-semibold uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{t('hanzi.memory')}</p>
          <p className={`text-sm ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
            {isAr ? item.memory_ar : item.memory_en}
          </p>
        </div>
      </div>

      {/* V2.0.5: colored component breakdown */}
      {hanziParts[item.char] && (
        <div className="flex items-center justify-center gap-2 mb-3 rounded-xl bg-white/[0.02] border border-white/5 p-3 flex-wrap">
          {hanziParts[item.char].map((p, i) => (
            <span key={p.part} className="inline-flex items-center gap-2">
              {i > 0 && <span className="text-white/40 text-lg">+</span>}
              <span className="inline-flex flex-col items-center">
                <span className="font-chinese text-3xl" style={{ color: p.color }}>{p.part}</span>
                <span className="text-[10px]" style={{ color: p.color }}>{isAr ? p.meaning_ar : p.meaning_en}</span>
              </span>
            </span>
          ))}
          <span className="text-white/40 text-lg mx-1">=</span>
          <span className="font-chinese text-3xl text-white">{item.char}</span>
        </div>
      )}

      {/* V2.0.5: pictograph evolution */}
      {(() => {
        const evo = hanziEvolution.find(e => e.char === item.char);
        if (!evo) return null;
        return (
          <div className="flex items-center justify-center gap-4 mb-3 rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#f59e0b]" dangerouslySetInnerHTML={{ __html: evo.svg }} />
            <span className="text-white/40 text-xl">→</span>
            <span className="font-chinese text-4xl text-white">{evo.char}</span>
          </div>
        );
      })()}

      {(item.components || item.stroke_hint) && !compact && (
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
          {item.components && <>🧩 {item.components}{item.stroke_hint ? ' · ' : ''}</>}
          {item.stroke_hint && <>✍️ {item.stroke_hint}</>}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <p className="text-[10px] font-display font-semibold uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{t('hanzi.exampleWord')}</p>
          <p className="font-chinese text-lg text-white">{item.example_word.chinese}</p>
          <PinyinText>{item.example_word.pinyin}</PinyinText>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? item.example_word.arabic : item.example_word.english}</p>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <p className="text-[10px] font-display font-semibold uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{t('hanzi.exampleSentence')}</p>
          <p className="font-chinese text-base text-white">{item.example_sentence.chinese}</p>
          <PinyinText>{item.example_sentence.pinyin}</PinyinText>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? item.example_sentence.arabic : item.example_sentence.english}</p>
        </div>
      </div>
    </div>
  );
}
