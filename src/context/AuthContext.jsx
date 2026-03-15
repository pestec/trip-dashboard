import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url || url === 'https://your-project-id.supabase.co') {
      // Env vars not configured — skip auth, stay on login page
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
    }).catch(() => {
      setSession(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, loading: session === undefined, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
