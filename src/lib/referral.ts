// V3.15 — referral system. Calls referral RPCs (each verifies the caller
// server-side). No service_role, no secrets.
import { supabase } from '@/lib/supabase';

export type RedeemResult = 'redeemed' | 'self' | 'already' | 'bad_code' | 'no_code' | 'no_auth' | 'error';

export interface ReferralStats {
  invited_count: number;
  coins_from_referrals: number;
}

/** Get (or create on first call) the current user's referral code. */
export async function getMyReferralCode(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_my_referral_code');
  if (error) { console.error('get_my_referral_code', error.message); return null; }
  return (data as string) || null;
}

/** Redeem a referral code (called once for a newly signed-up user). */
export async function redeemReferral(code: string): Promise<RedeemResult> {
  const { data, error } = await supabase.rpc('redeem_referral', { p_code: code });
  if (error) { console.error('redeem_referral', error.message); return 'error'; }
  return (data as RedeemResult) || 'error';
}

/** How many friends the user invited + coins earned. */
export async function getMyReferralStats(): Promise<ReferralStats> {
  const { data, error } = await supabase.rpc('get_my_referral_stats');
  if (error) { console.error('get_my_referral_stats', error.message); return { invited_count: 0, coins_from_referrals: 0 }; }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    invited_count: Number(row?.invited_count || 0),
    coins_from_referrals: Number(row?.coins_from_referrals || 0),
  };
}

const PENDING_KEY = 'nihao_pending_ref';

/** Stash a referral code from the URL (?ref=) so we can redeem it right after
 *  the user finishes signing up. Uses sessionStorage (cleared on redeem). */
export function stashPendingReferral(code: string): void {
  try { sessionStorage.setItem(PENDING_KEY, code.trim().toUpperCase()); } catch { /* ignore */ }
}

export function getPendingReferral(): string | null {
  try { return sessionStorage.getItem(PENDING_KEY); } catch { return null; }
}

export function clearPendingReferral(): void {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
}
