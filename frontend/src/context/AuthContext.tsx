'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  isLoggedIn: boolean;
  login: (identifier: string, otp: string) => Promise<AuthUser>;
  register: (data: { name: string; email: string; mobile: string; otp: string }) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('jothidam_token');
    const u = localStorage.getItem('jothidam_user');
    if (t) setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        /* ignore malformed cache */
      }
    }
    if (t) {
      api
        .get('/auth/me')
        .then(res => {
          const fresh = res.data.user as AuthUser;
          setUser(fresh);
          localStorage.setItem('jothidam_user', JSON.stringify(fresh));
        })
        .catch(err => {
          if (err?.response?.status === 401) {
            localStorage.removeItem('jothidam_token');
            localStorage.removeItem('jothidam_user');
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, []);

  const login = async (identifier: string, otp: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, otp });
      const { token: t, user: u } = res.data as { token: string; user: AuthUser };
      localStorage.setItem('jothidam_token', t);
      localStorage.setItem('jothidam_user', JSON.stringify(u));
      setToken(t);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const register: AuthContextValue['register'] = async data => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { token: t, user: u } = res.data as { token: string; user: AuthUser };
      localStorage.setItem('jothidam_token', t);
      localStorage.setItem('jothidam_user', JSON.stringify(u));
      setToken(t);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jothidam_token');
    localStorage.removeItem('jothidam_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, initializing, isLoggedIn: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
