// V3.0A — email lead capture. INSERT-only into Supabase email_leads. Stores only
// the email + non-personal context (source path/type) and a consent flag. No
// name/phone/age/user_id. The email is never sent to analytics.
import { supabase } from '@/lib/supabase';

export interface LeadResult { ok: boolean; reason?: 'invalid' | 'duplicate' | 'error' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/**
 * Subscribe an email. consent must be true (DB also enforces this via RLS).
 * Returns a small result object so the UI can show the right message.
 */
export async function subscribeEmail(
  email: string,
  sourceType: string,
  sourcePath: string,
): Promise<LeadResult> {
  const clean = email.trim().toLowerCase();
  if (!isValidEmail(clean)) return { ok: false, reason: 'invalid' };

  try {
    const { error } = await supabase.from('email_leads').insert({
      email: clean,
      source_type: sourceType,
      source_path: sourcePath,
      consent: true,
    });
    if (error) {
      // unique violation → already subscribed (treat as a soft success)
      if ((error as { code?: string }).code === '23505') return { ok: false, reason: 'duplicate' };
      return { ok: false, reason: 'error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
