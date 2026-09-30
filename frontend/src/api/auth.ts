/**
 * Stage 2 auth API layer — the ONLY place that talks to Django auth endpoints.
 *
 * Token strategy (MVP, documented tradeoff):
 * - Access + refresh tokens are kept in localStorage so the session survives
 *   a page reload. This is practical for the hackathon MVP but has a known
 *   XSS implication: any injected script running on this origin can read
 *   localStorage and steal the tokens.
 * - Mitigations in place: short-lived access tokens (15 min), refresh-token
 *   blacklisting on logout, no tokens in URLs/logs, Bearer header only.
 * - Production hardening (not in this stage): httpOnly secure cookies for the
 *   refresh token + CSRF protection, or a backend session, so JS cannot read
 *   the long-lived credential.
 *
 * React NEVER talks to the database — only to these HTTP APIs. Django owns
 * all SQL, password hashing, and JWT signing.
 */

import type {
  ApiErrorData,
  AuthUser,
  HealthResponse,
  LoginPayload,
  LoginResponse,
  ProtectedTestResponse,
  RefreshResponse,
  RegisterPayload,
} from "../types/auth";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const ACCESS_KEY = "idle2use.access";
const REFRESH_KEY = "idle2use.refresh";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function setAccessToken(access: string): void {
  localStorage.setItem(ACCESS_KEY, access);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/** Shown to users instead of raw SimpleJWT error payloads. */
export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";

/** Thrown when there is no usable credential (missing/expired token). */
export class SessionExpiredError extends Error {
  constructor(message: string = SESSION_EXPIRED_MESSAGE) {
    super(message);
    this.name = "SessionExpiredError";
  }
}

/** True when an error means "this access token will never work again". */
export function isTokenInvalidError(err: unknown): boolean {
  if (err instanceof SessionExpiredError) return true;
  if (err instanceof ApiError && err.status === 401) {
    const data = err.data ?? {};
    const code = typeof data.code === "string" ? data.code : "";
    const detail =
      typeof data.detail === "string" ? data.detail : "";
    return (
      code === "token_not_valid" ||
      /token not valid|token .* expired|given token/i.test(detail)
    );
  }
  return false;
}

/** User-facing message: friendly for auth failures, detailed otherwise. */
export function friendlyError(err: unknown): string {
  if (isTokenInvalidError(err)) return SESSION_EXPIRED_MESSAGE;
  if (err instanceof Error && /no .*token/i.test(err.message)) {
    return SESSION_EXPIRED_MESSAGE;
  }
  return formatApiError(err);
}

/* ---- session events (auth layer -> AuthProvider -> UI) ---------------- */

function emit(name: "idle2use:session-expired" | "idle2use:refresh-start" | "idle2use:refresh-end"): void {
  window.dispatchEvent(new CustomEvent(name));
}

export function onSessionExpired(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener("idle2use:session-expired", handler);
  return () => window.removeEventListener("idle2use:session-expired", handler);
}

export function onRefreshActivity(listener: (refreshing: boolean) => void): () => void {
  const start = () => listener(true);
  const end = () => listener(false);
  window.addEventListener("idle2use:refresh-start", start);
  window.addEventListener("idle2use:refresh-end", end);
  return () => {
    window.removeEventListener("idle2use:refresh-start", start);
    window.removeEventListener("idle2use:refresh-end", end);
  };
}

/**
 * Single-flight refresh: concurrent 401s share ONE token/refresh call, so a
 * burst of dashboard requests can never stampede the endpoint or loop.
 * Resolves with the fresh access token; on failure clears tokens, notifies
 * the app once, and throws SessionExpiredError.
 */
let refreshPromise: Promise<string> | null = null;

export function refreshAccessTokenSingleflight(): Promise<string> {
  if (!refreshPromise) {
    emit("idle2use:refresh-start");
    refreshPromise = (async () => {
      try {
        return await refreshAccessToken();
      } catch (err: unknown) {
        clearTokens();
        emit("idle2use:session-expired");
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("[auth] refresh failed", err);
        }
        throw new SessionExpiredError();
      } finally {
        refreshPromise = null;
        emit("idle2use:refresh-end");
      }
    })();
  }
  return refreshPromise;
}

export class ApiError extends Error {
  status: number;
  data: ApiErrorData | null;

  constructor(status: number, data: ApiErrorData | null, fallback: string) {
    super(fallback);
    this.status = status;
    this.data = data;
  }
}

/** Flatten DRF error payloads into a human-readable message. */
export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.data) {
      const parts: string[] = [];
      for (const [field, value] of Object.entries(err.data)) {
        const messages = Array.isArray(value) ? value.join(" ") : value;
        parts.push(field === "detail" ? messages : `${field}: ${messages}`);
      }
      if (parts.length > 0) return parts.join(" | ");
    }
    return `Request failed (HTTP ${err.status})`;
  }
  return err instanceof Error ? err.message : "Unknown error";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  if (authenticated) {
    // All authenticated calls share the refresh-and-retry pipeline below.
    return authedApiRequest<T>(path, options);
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (res.status === 204 || res.status === 205) return undefined as T;
  let data: T | ApiErrorData | null = null;
  try {
    data = (await res.json()) as T | ApiErrorData;
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new ApiError(res.status, (data as ApiErrorData) ?? null, `HTTP ${res.status}`);
  }
  return data as T;
}

/**
 * Authenticated request pipeline (single implementation for the whole app):
 * Bearer <access_token>; on 401/token_not_valid → single-flight refresh →
 * retry the original request ONCE with the fresh token. If the retry or the
 * refresh fails, a SessionExpiredError propagates (tokens already cleared,
 * app already notified). Retrying at most once per call makes a refresh loop
 * structurally impossible.
 */
export async function authedApiRequest<T>(
  path: string,
  options: RequestInit = {},
  canRetry = true,
): Promise<T> {
  const access = getAccessToken();
  if (!access) throw new SessionExpiredError();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (res.status === 204 || res.status === 205) return undefined as T;
  let data: T | ApiErrorData | null = null;
  try {
    data = (await res.json()) as T | ApiErrorData;
  } catch {
    data = null;
  }
  if (res.ok) return data as T;

  const err = new ApiError(res.status, (data as ApiErrorData) ?? null, `HTTP ${res.status}`);
  if (canRetry && isTokenInvalidError(err)) {
    const fresh = await refreshAccessTokenSingleflight();
    if (!fresh) throw new SessionExpiredError();
    // Retry exactly once with the fresh token — never again.
    return authedApiRequest<T>(path, options, false);
  }
  if (import.meta.env.DEV && !isTokenInvalidError(err)) {
    // eslint-disable-next-line no-console
    console.error(`[api] ${options.method ?? "GET"} ${path} →`, err);
  }
  throw err;
}

export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health/");
}

export function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setTokens(data.access, data.refresh);
  return data;
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token. Please log in again.");
  const data = await request<RefreshResponse>("/api/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  setAccessToken(data.access);
  return data.access;
}

export function fetchMe(): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me/", {}, true);
}

export function fetchProtectedTest(): Promise<ProtectedTestResponse> {
  return request<ProtectedTestResponse>("/api/auth/protected-test/", {}, true);
}

export async function logoutUser(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    // Server-side: blacklist the refresh token. Frontend tokens are cleared
    // regardless so a failed call still logs the user out locally.
    try {
      await request("/api/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      }, true);
    } catch {
      // Intentionally ignored: local logout must always succeed.
    }
  }
  clearTokens();
}
