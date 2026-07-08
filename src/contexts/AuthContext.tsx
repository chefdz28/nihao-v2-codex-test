import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'teacher' | 'student';
  isAdmin: boolean;
  isTeacher: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, asTeacher?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const buildAuthUser = useCallback(async (supabaseUser: User): Promise<AuthUser | null> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', supabaseUser.id)
        .single();

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      const isAdmin = !!roles?.find(r => r.role === 'admin');
      const isTeacher = !!roles?.find(r => r.role === 'teacher');
      const role: 'admin' | 'teacher' | 'student' = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Student',
        avatarUrl: profile?.avatar_url || undefined,
        role,
        isAdmin,
        isTeacher,
      };
    } catch {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Student',
        role: 'student',
        isAdmin: false,
        isTeacher: false,
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        buildAuthUser(s.user).then(u => {
          if (mounted) {
            setUser(u);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        buildAuthUser(s.user).then(u => {
          if (mounted) setUser(u);
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [buildAuthUser]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, asTeacher = false) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, signup_role: asTeacher ? 'teacher' : 'student' } },
    });
    if (error) throw error;
    // If the user chose "teacher" and a session exists (email confirmation off),
    // grant the teacher role now. Otherwise it can be granted on first sign-in.
    if (asTeacher && data.session?.user) {
      try { await supabase.rpc('set_my_role_teacher'); } catch { /* fail-silent */ }
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // honor a deferred "teacher" choice made at sign-up (email-confirmation flow)
    if (data.user?.user_metadata?.signup_role === 'teacher') {
      try { await supabase.rpc('set_my_role_teacher'); } catch { /* fail-silent */ }
    }
    // redeem a pending referral captured at sign-up (if any)
    try {
      const pending = sessionStorage.getItem('nihao_pending_ref');
      if (pending) {
        await supabase.rpc('redeem_referral', { p_code: pending });
        sessionStorage.removeItem('nihao_pending_ref');
      }
    } catch { /* fail-silent */ }
  }, []);

  // V3.4: Google OAuth via Supabase (provider must be enabled in Supabase
  // dashboard: Authentication → Providers → Google). No client secret in the
  // frontend; Supabase handles the OAuth flow and redirect.
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false,
      isTeacher: user?.isTeacher || false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
