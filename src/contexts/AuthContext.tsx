import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'partner';
}

interface AuthContextType {
  session: any;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, phone?: string, role?: 'admin' | 'partner') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error('Please enter email and password') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('approval_status, rejection_reason')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userError) throw userError;

        if (userData?.approval_status === 'pending') {
          await supabase.auth.signOut();
          return { error: new Error('Your account is pending approval. Please wait for admin to approve your registration.') };
        }

        if (userData?.approval_status === 'rejected') {
          await supabase.auth.signOut();
          const reason = userData.rejection_reason ? `\nReason: ${userData.rejection_reason}` : '';
          return { error: new Error(`Your registration was not approved.${reason}\n\nPlease contact admin for more information.`) };
        }

        await loadUserProfile(data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Invalid login credentials') };
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string, role: 'admin' | 'partner' = 'partner') => {
    if (!email || !password || !name) {
      return { error: new Error('Please fill all required fields') };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      const approvalStatus = role === 'admin' ? 'approved' : 'pending';
      const approvedAt = role === 'admin' ? new Date().toISOString() : null;

      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name,
        phone: phone || null,
        role,
        approval_status: approvalStatus,
        approved_at: approvedAt,
      });

      if (profileError) throw profileError;

      if (role === 'admin') {
        await loadUserProfile(authData.user.id);
      } else {
        await supabase.auth.signOut();
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || 'Failed to create account') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
