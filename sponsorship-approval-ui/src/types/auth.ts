import type { LoginResponse } from './index';

export interface AuthState {
  session: LoginResponse | null;
  error: string;
  login: (response: LoginResponse) => void;
  logout: () => void;
  setError: (message: string) => void;
}
