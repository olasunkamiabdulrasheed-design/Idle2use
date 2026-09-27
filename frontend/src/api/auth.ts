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

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (authenticated) {
    const access = getAccessToken();
    if (!access) throw new Error("No access token. Please log in.");
    headers.Authorization = `Bearer ${access}`;
  }
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
