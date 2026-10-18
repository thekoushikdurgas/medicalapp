/**
 * Custom hook for auth state management.
 * Uses AUTH_KEYS from lib/auth for consistent localStorage keys.
 */

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { AUTH_KEYS } from "@/lib/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    const userData = localStorage.getItem(AUTH_KEYS.USER);

    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(
    (accessToken: string, user: User) => {
      localStorage.setItem(AUTH_KEYS.TOKEN, accessToken);
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return { ...state, login, logout };
}
