import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginResponse } from '../types';

export interface AuthState {
  session: LoginResponse | null;
  error: string;
  login: (response: LoginResponse) => void;
  logout: () => void;
  setError: (message: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LoginResponse | null>(() => {
    const saved = localStorage.getItem('sponsorship-session');
    return saved ? (JSON.parse(saved) as LoginResponse) : null;
  });
  const [error, setError] = useState('');

  const login = (response: LoginResponse) => {
    localStorage.setItem('sponsorship-session', JSON.stringify(response));
    setSession(response);
  };

  const logout = () => {
    localStorage.removeItem('sponsorship-session');
    setSession(null);
    setError('');
  };

  return (
    <AuthContext.Provider value={{ session, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
