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

// ============================================================
// V3.10 — assignments + feedback (phase 2+3)
// ============================================================

export interface Assignment {
  id: string;
  title: string;
  content_type: string;
  content_ref: string | null;
  note: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
  completed_at?: string | null;
}
export interface MyAssignment extends Assignment {
  teacher_name: string | null;
}
export interface Feedback {
  id: string;
  points: number;
  note: string | null;
  created_at: string;
}
export interface MyFeedback extends Feedback {
  teacher_name: string | null;
}

export type CreateAssignmentResult = 'created' | 'not_teacher' | 'not_linked' | 'no_title' | 'error';
export type GiveFeedbackResult = 'saved' | 'not_teacher' | 'not_linked' | 'error';

// ---- teacher side ----
export async function createAssignment(input: {
  studentId: string; title: string; contentType?: string; contentRef?: string | null; note?: string | null; due?: string | null;
}): Promise<CreateAssignmentResult> {
  const { data, error } = await supabase.rpc('teacher_create_assignment', {
    p_student_id: input.studentId, p_title: input.title,
    p_content_type: input.contentType || 'custom', p_content_ref: input.contentRef ?? null,
    p_note: input.note ?? null, p_due: input.due ?? null,
  });
  if (error) { console.error('teacher_create_assignment', error.message); return 'error'; }
  return (data as CreateAssignmentResult) || 'error';
}

export async function deleteAssignment(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('teacher_delete_assignment', { p_id: id });
  if (error) { console.error('teacher_delete_assignment', error.message); return false; }
  return true;
}

export async function fetchStudentAssignments(studentId: string): Promise<Assignment[]> {
  const { data, error } = await supabase.rpc('get_student_assignments', { p_student_id: studentId });
  if (error) { console.error('get_student_assignments', error.message); return []; }
  return (data as Assignment[]) || [];
}

export async function giveFeedback(studentId: string, points: number, note?: string | null): Promise<GiveFeedbackResult> {
  const { data, error } = await supabase.rpc('teacher_give_feedback', { p_student_id: studentId, p_points: points, p_note: note ?? null });
  if (error) { console.error('teacher_give_feedback', error.message); return 'error'; }
  return (data as GiveFeedbackResult) || 'error';
}

export async function fetchStudentFeedback(studentId: string): Promise<Feedback[]> {
  const { data, error } = await supabase.rpc('get_student_feedback', { p_student_id: studentId });
  if (error) { console.error('get_student_feedback', error.message); return []; }
  return (data as Feedback[]) || [];
}

// ---- student side ----
export async function fetchMyAssignments(): Promise<MyAssignment[]> {
  const { data, error } = await supabase.rpc('get_my_assignments');
  if (error) { console.error('get_my_assignments', error.message); return []; }
  return (data as MyAssignment[]) || [];
}

export async function completeMyAssignment(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('student_complete_assignment', { p_id: id });
  if (error) { console.error('student_complete_assignment', error.message); return false; }
  return true;
}

export async function fetchMyFeedback(): Promise<MyFeedback[]> {
  const { data, error } = await supabase.rpc('get_my_feedback');
  if (error) { console.error('get_my_feedback', error.message); return []; }
  return (data as MyFeedback[]) || [];
}
