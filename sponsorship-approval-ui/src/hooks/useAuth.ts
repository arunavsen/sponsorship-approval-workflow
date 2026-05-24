import { useContext } from 'react';
import { AuthContext } from './authContext';
import type { AuthState } from '../types/auth';

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
