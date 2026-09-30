/**
 * Shared auth state for all pages (landing / login / register / app shell).
 * API logic stays in api/auth.ts — this context only orchestrates it.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  clearTokens,
  fetchHealth,
  fetchMe,
  formatApiError,
  getAccessToken,
  isTokenInvalidError,
  loginUser,
  logoutUser,
  onRefreshActivity,
  onSessionExpired,
  refreshAccessToken,
  registerUser,
  SESSION_EXPIRED_MESSAGE,
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
  /** True while a single-flight token refresh is in flight. */
  refreshing: boolean;
  /** Set when the session died (expired refresh); Login displays it. */
  sessionMessage: string;
  clearSessionMessage: () => void;
  health: HealthState;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");
  const [health, setHealth] = useState<HealthState>({ state: "loading" });

  // Session died somewhere in the app (refresh failed): drop the user so
  // protected routes redirect to /login, and surface a friendly message.
  useEffect(() => {
    const offExpired = onSessionExpired(() => {
      setUser(null);
      setSessionMessage(SESSION_EXPIRED_MESSAGE);
    });
    const offActivity = onRefreshActivity(setRefreshing);
    return () => {
      offExpired();
      offActivity();
    };
  }, []);

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
          } catch (err: unknown) {
            // Only nuke stored tokens when the credential itself is dead;
            // a network blip must not log the user out.
            if (isTokenInvalidError(err)) {
              clearTokens();
              if (!cancelled) setSessionMessage(SESSION_EXPIRED_MESSAGE);
            }
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
    setSessionMessage("");
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const created = await registerUser(payload);
    return created.username;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setSessionMessage("");
    setUser(null);
  }, []);

  const clearSessionMessage = useCallback(() => setSessionMessage(""), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        restoring,
        refreshing,
        sessionMessage,
        clearSessionMessage,
        health,
        login,
        register,
        logout,
      }}
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
