import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * V3.4 — gate a test "start" action behind login. Returns a `requireAuth`
 * wrapper: if the user is logged in it runs the action immediately; otherwise it
 * opens the gate (set `gateOpen`) and the page renders <AuthGate/>. Guests can
 * still be allowed through via the gate's onGuest if the page passes one.
 */
export function useTestGate() {
  const { isAuthenticated } = useAuth();
  const [gateOpen, setGateOpen] = useState(false);

  // runs `action` if authed, else opens the gate
  const requireAuth = useCallback((action: () => void) => {
    if (isAuthenticated) { action(); return true; }
    setGateOpen(true);
    return false;
  }, [isAuthenticated]);

  const closeGate = useCallback(() => setGateOpen(false), []);

  return { isAuthenticated, gateOpen, requireAuth, closeGate, setGateOpen };
}
