/**
 * Shared authenticated HTTP layer for Stages 6-10 API surfaces.
 * Same conventions as requests.ts (auth.ts owns ApiError/tokens).
 */

import type { ApiErrorData } from "../types/auth";
import { API_BASE_URL, ApiError, getAccessToken } from "./auth";

export async function authedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const access = getAccessToken();
  if (!access) throw new Error("No access token. Please log in.");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (res.status === 204) return undefined as T;
  let data: T | ApiErrorData | null = null;
  try {
    data = (await res.json()) as T | ApiErrorData;
  } catch {
    data = null;
  }
  if (!res.ok) throw new ApiError(res.status, data as ApiErrorData, `HTTP ${res.status}`);
  return data as T;
}
