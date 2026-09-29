import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { queryClient } from "../../../app/query-client";
import { supabase } from "../../../api/supabase-client";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setIsLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setIsLoading(false); if (!session) queryClient.clear(); });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    async signIn(email, password) { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; },
    async signUp(email, password, displayName) { const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: displayName } } }); if (error) throw error; return Boolean(data.session); },
    async signOut() { const { error } = await supabase.auth.signOut(); if (error) throw error; },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
