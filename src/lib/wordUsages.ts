// V2.8A/B/C — find stories/dialogues/lessons that use a given Chinese word, for
// cross-links on the word page. Pure lookups over existing static data; no network.
import { stories } from '@/data/stories2';
import { dialogues } from '@/data/hanziExtra';
import { studentDialogues } from '@/data/studentDialogues';
import { hsk1FullLessons } from '@/data/hsk1-full';
import { STAGES } from '@/data/levels';

export interface WordUsage { type: 'story' | 'dialogue' | 'lesson'; id: string; title: string; path: string }

// resolve a lesson's order index → stage id, so we can deep-link /courses/:stage/:lesson
function lessonPath(lessonId: string, order: number): string {
  for (const st of STAGES) {
    if (st.range && order >= st.range[0] && order <= st.range[1]) {
      return `/courses/${st.id}/${lessonId}`;
    }
  }
  return '/courses';
}

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

  // legacy interactive dialogues (practice mode) — not indexed, internal link only
  for (const d of dialogues) {
    const used = d.turns?.some(turn =>
      turn.chinese?.includes(chinese) ||
      turn.choices?.some(c => c.chinese?.includes(chinese))
    );
    if (used) {
      out.push({ type: 'dialogue', id: d.id, title: d.title_ar || d.title_en, path: `/dialogues-practice` });
    }
  }

  // V2.8C: lessons that teach this word (match on lesson vocabulary)
  let order = 0;
  for (const lesson of hsk1FullLessons) {
    order++;
    const used = lesson.vocabulary?.some(v => v.chinese === chinese);
    if (used) {
      const title = (lesson as { titleAr?: string; titleEn?: string }).titleAr
        || (lesson as { titleEn?: string }).titleEn || lesson.id;
      out.push({ type: 'lesson', id: lesson.id, title, path: lessonPath(lesson.id, order) });
    }
  }

  return out.slice(0, 10);
}
