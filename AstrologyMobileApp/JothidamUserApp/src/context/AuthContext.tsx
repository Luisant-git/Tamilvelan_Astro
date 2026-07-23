import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/auth.api';
import { setAuthToken, registerUnauthorizedHandler } from '../services/client';
import { navigationRef } from '../navigation/navigationRef';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  isAdmin: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  otp: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, otp: string) => Promise<AuthUser>;
  register: (data: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const USER_STORAGE_KEY = 'jothidam_auth_user';
const TOKEN_STORAGE_KEY = 'jothidam_auth_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = async (token: string, nextUser: AuthUser) => {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setAuthToken(token);
    setUser(nextUser);
    return nextUser;
  };

  const clear = async () => {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
    setAuthToken(null);
    setUser(null);
    // Reset (not navigate) so the entire protected stack history is wiped —
    // otherwise the back button could still reach screens that need a user.
    // Covers both manual logout and the automatic 401 handler above, since
    // both funnel through this function.
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clear();
    });

    (async () => {
      try {
        const [token, savedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY),
        ]);
        if (!token || !savedUser) return;

        setAuthToken(token);
        setUser(JSON.parse(savedUser));

        // Validate the restored token immediately rather than waiting for
        // the first real authenticated call to discover it's stale — a
        // failed call here triggers the 401 interceptor above, which clears
        // the session automatically.
        const { user: me } = await authApi.me();
        setUser({ id: me.id, name: me.name, email: me.email, mobile: me.mobile, isAdmin: me.isAdmin });
      } catch {
        // Network error on startup shouldn't log the user out — only an
        // actual 401 (handled by the interceptor) should.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (identifier: string, otp: string) => {
    const { token, user: loggedInUser } = await authApi.login({ identifier, otp });
    return persist(token, { ...loggedInUser });
  };

  const register = async (data: RegisterPayload) => {
    const { token, user: newUser } = await authApi.register(data);
    return persist(token, { ...newUser });
  };

  const logout = async () => {
    await clear();
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
