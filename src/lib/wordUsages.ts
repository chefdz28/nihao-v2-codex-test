// V2.8A/B — find stories/dialogues that use a given Chinese word, for cross-links
// on the word page. Pure lookups over existing static data; no network.
import { stories } from '@/data/stories2';
import { dialogues } from '@/data/hanziExtra';
import { studentDialogues } from '@/data/studentDialogues';

export interface WordUsage { type: 'story' | 'dialogue'; id: string; title: string; path: string }

export function findUsages(chinese: string): WordUsage[] {
  const out: WordUsage[] = [];
  if (!chinese) return out;

  for (const s of stories) {
    const inTitle = s.title_zh?.includes(chinese);
    const inSentence = s.sentences?.some(sn => sn.zh?.includes(chinese));
    const inVocab = s.vocab?.some(v => v.zh === chinese);
    if (inTitle || inSentence || inVocab) {
      out.push({ type: 'story', id: s.id, title: s.title_ar || s.title_zh, path: `/stories/${s.id}` });
    }
  }

  // V2.8B: rich student dialogues — link to the specific dialogue page
  for (const d of studentDialogues) {
    const used = d.turns?.some(turn => turn.chinese?.includes(chinese))
      || d.vocab?.some(v => v.chinese === chinese);
    if (used) {
      out.push({ type: 'dialogue', id: d.id, title: d.title_ar, path: `/dialogues/${d.id}` });
    }
  }

  // legacy interactive dialogues (practice mode)
  for (const d of dialogues) {
    const used = d.turns?.some(turn =>
      turn.chinese?.includes(chinese) ||
      turn.choices?.some(c => c.chinese?.includes(chinese))
    );
    if (used) {
      out.push({ type: 'dialogue', id: d.id, title: d.title_ar || d.title_en, path: `/dialogues-practice` });
    }
  }

  return out.slice(0, 8);
}
