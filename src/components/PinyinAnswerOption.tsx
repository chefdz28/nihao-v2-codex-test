import PinyinText from '@/components/PinyinText';
import { pinyinForOption } from '@/lib/simPinyin';

/**
 * V3.4.1 — renders an HSK simulation answer option. If the option is Chinese
 * text, we have pinyin for it, and the smart-pinyin mode says it's visible, the
 * pinyin is shown in smaller muted text below the character. Otherwise just the
 * option text (numbers / Arabic glosses / pinyin options are shown as-is).
 */
export default function PinyinAnswerOption({
  option,
  showPinyin,
}: {
  option: string;
  showPinyin: boolean;
}) {
  const py = showPinyin ? pinyinForOption(option) : undefined;

  return (
    <span className="inline-flex flex-col items-start leading-tight">
      <span className="font-chinese">{option}</span>
      {py && <PinyinText className="text-xs mt-0.5 opacity-80">{py}</PinyinText>}
    </span>
  );
}
