import { useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginResponse } from '../types';
import { AuthContext } from './authContext';

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
