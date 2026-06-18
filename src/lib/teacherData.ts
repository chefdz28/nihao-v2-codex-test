// V3.9 — teacher data access. Calls teacher-only Supabase RPCs (each verifies
// the caller is a teacher/admin server-side and scopes to the caller's own
// linked students). No service_role key, no secrets.
import { supabase } from '@/lib/supabase';

export interface TeacherStudent {
  student_id: string;
  email: string | null;
  display_name: string | null;
  linked_at: string | null;
  last_activity: string | null;
  lessons_done: number;
  quiz_done: number;
  story_done: number;
  daily_done: number;
  total_done: number;
  latest_content: string | null;
}

export interface TeacherProgressRow {
  content_type: string;
  content_slug: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

export type AddStudentResult = 'linked' | 'not_found' | 'self' | 'not_teacher' | 'error';

/** List the calling teacher's linked students + a progress summary. */
export async function fetchTeacherStudents(): Promise<TeacherStudent[]> {
  const { data, error } = await supabase.rpc('get_teacher_students');
  if (error) { console.error('get_teacher_students', error.message); return []; }
  return (data as TeacherStudent[]) || [];
}

/** Detailed progress rows for one of the teacher's students. */
export async function fetchTeacherStudentProgress(studentId: string, limit = 100): Promise<TeacherProgressRow[]> {
  const { data, error } = await supabase.rpc('get_teacher_student_progress', { p_student_id: studentId, limit_n: limit });
  if (error) { console.error('get_teacher_student_progress', error.message); return []; }
  return (data as TeacherProgressRow[]) || [];
}

/** Link a student to the calling teacher by email. Returns a status string. */
export async function addTeacherStudent(email: string): Promise<AddStudentResult> {
  const { data, error } = await supabase.rpc('teacher_add_student', { student_email: email });
  if (error) { console.error('teacher_add_student', error.message); return 'error'; }
  return (data as AddStudentResult) || 'error';
}

/** Remove a linked student (only the teacher's own link). */
export async function removeTeacherStudent(studentId: string): Promise<boolean> {
  const { error } = await supabase.rpc('teacher_remove_student', { p_student_id: studentId });
  if (error) { console.error('teacher_remove_student', error.message); return false; }
  return true;
}

/** Grant the teacher role to the current user (used at sign-up). */
export async function becomeTeacher(): Promise<boolean> {
  const { error } = await supabase.rpc('set_my_role_teacher');
  if (error) { console.error('set_my_role_teacher', error.message); return false; }
  return true;
}

// ---- CSV export (pure JS, no external lib) ----
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
