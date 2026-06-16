// V3.4.2 — admin data access. Calls the admin-only Supabase RPCs (each verifies
// the caller is an admin server-side). No service_role key, no secrets. If the
// caller isn't an admin, the RPCs return no rows.
import { supabase } from '@/lib/supabase';

export interface AdminStudent {
  user_id: string;
  email: string | null;
  display_name: string | null;
  provider: string | null;
  role: string;
  joined_at: string | null;
  last_activity: string | null;
  lessons_done: number;
  dialogues_done: number;
  stories_done: number;
  daily_done: number;
  quiz_done: number;
  total_done: number;
  latest_content: string | null;
}

export interface AdminProgressRow {
  user_id: string;
  email: string | null;
  content_type: string;
  content_slug: string;
  status: string;
  score: number | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminLead {
  email: string;
  source_path: string | null;
  source_type: string | null;
  consent: boolean;
  created_at: string;
}

export interface AdminOverview {
  total_students: number;
  total_admins: number;
  total_leads: number;
  total_progress: number;
  completions_today: number;
  total_drafts: number;
}

export async function fetchAdminStudents(): Promise<AdminStudent[]> {
  const { data, error } = await supabase.rpc('get_admin_students');
  if (error) throw error;
  return (data || []) as AdminStudent[];
}

export async function fetchAdminProgress(limit = 500): Promise<AdminProgressRow[]> {
  const { data, error } = await supabase.rpc('get_admin_progress', { limit_n: limit });
  if (error) throw error;
  return (data || []) as AdminProgressRow[];
}

export async function fetchAdminLeads(): Promise<AdminLead[]> {
  const { data, error } = await supabase.rpc('get_admin_email_leads');
  if (error) throw error;
  return (data || []) as AdminLead[];
}

export async function fetchAdminOverview(): Promise<AdminOverview | null> {
  const { data, error } = await supabase.rpc('get_admin_overview');
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as AdminOverview) || null;
}

/** Build a CSV string from rows (no external library). */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => esc(r[c])).join(',')).join('\n');
  return header + '\n' + body;
}

/** Trigger a client-side CSV download (no external library). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
