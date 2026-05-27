'use client';
import { useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import type { User } from '@/lib/types';

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const { setUser } = useAppStore();

  const didInit = useRef(false);
  if (!didInit.current) {
    didInit.current = true;
    useAppStore.getState().setUser(initialUser);
  }

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email ?? '' } : null);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}
