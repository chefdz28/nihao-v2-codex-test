// V2.0.3 grammar data service.
// Strategy: try the optional Supabase tables (grammar_points / grammar_exercises);
// if they are missing, error, or empty → use the built-in fallback for lessons 1–15.
// The Grammar tab therefore works with zero database changes, and the database
// automatically takes over once rows exist (Admin-manageable later).
import { supabase } from '@/lib/supabase';
import type { LessonGrammar, GrammarPoint, GrammarExercise } from '@/types/grammar';
import { grammarFallback } from '@/data/grammarFallback2';

export async function fetchLessonGrammar(lessonId: string, lessonOrderNum: number): Promise<LessonGrammar> {
  // 1) Try the database (optional tables — failures are expected and fine)
  try {
    const { data: points, error: pErr } = await supabase
      .from('grammar_points')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_num');

    if (!pErr && points && points.length > 0) {
      const { data: exercises, error: eErr } = await supabase
        .from('grammar_exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_num');

      return {
        points: points as GrammarPoint[],
        exercises: (eErr ? [] : (exercises || [])) as GrammarExercise[],
        source: 'database',
      };
    }
  } catch {
    // table missing / network issue → fall through to fallback
  }

  // 2) Built-in fallback by lesson order number (lessons 1–15)
  const fb = grammarFallback[lessonOrderNum];
  if (fb) {
    return { points: fb.points, exercises: fb.exercises, source: 'fallback' };
  }

  // 3) Nothing available — the UI shows a friendly empty state
  return { points: [], exercises: [], source: 'empty' };
}
