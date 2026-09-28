/**
 * Shared auth state for all pages (landing / login / register / app shell).
 * API logic stays in api/auth.ts — this context only orchestrates it.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  fetchHealth,
  fetchMe,
  formatApiError,
  getAccessToken,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./api/auth";
import type {
  AuthUser,
  HealthResponse,
  LoginPayload,
  RegisterPayload,
} from "./types/auth";

type HealthState =
  | { state: "loading" }
  | { state: "ok"; data: HealthResponse }
  | { state: "error"; message: string };

interface AuthContextValue {
  user: AuthUser | null;
  restoring: boolean;
  health: HealthState;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [health, setHealth] = useState<HealthState>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((data) => {
        if (!cancelled) setHealth({ state: "ok", data });
      })
      .catch(() => {
        if (!cancelled)
          setHealth({ state: "error", message: "API unreachable" });
      });

    if (getAccessToken()) {
      void (async () => {
        try {
          const me = await fetchMe();
          if (!cancelled) setUser(me);
        } catch {
          try {
            await refreshAccessToken();
            const me = await fetchMe();
            if (!cancelled) setUser(me);
          } catch {
            /* refresh expired — stay logged out */
          }
        } finally {
          if (!cancelled) setRestoring(false);
        }
      })();
    } else {
      setRestoring(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginUser(payload);
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const created = await registerUser(payload);
    return created.username;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, restoring, health, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { formatApiError };
export type { HealthState };
