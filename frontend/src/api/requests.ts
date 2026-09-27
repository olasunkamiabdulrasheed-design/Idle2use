/**
 * Stage 4 capacity requests API layer — all "I NEED CAPACITY" HTTP calls.
 * React talks only to Django; Django owns validation, ownership, and storage.
 * Reuses the ApiError/token helpers from auth.ts (single HTTP layer).
 */

import type { ApiErrorData } from "../types/auth";
import type {
  CapacityRequest,
  CapacityRequestPayload,
  ParseResponse,
  RequestFilters,
} from "../types/requests";
import { API_BASE_URL, ApiError, getAccessToken } from "./auth";

async function authedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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
  if (!res.ok) {
    throw new ApiError(res.status, (data as ApiErrorData) ?? null, `HTTP ${res.status}`);
  }
  return data as T;
}

export function listRequests(filters: RequestFilters = {}): Promise<CapacityRequest[]> {
  const query = filters.status ? `?status=${encodeURIComponent(filters.status)}` : "";
  return authedRequest<CapacityRequest[]>(`/api/requests/${query}`);
}

export function createRequest(payload: CapacityRequestPayload): Promise<CapacityRequest> {
  return authedRequest<CapacityRequest>("/api/requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRequest(
  id: number,
  payload: Partial<CapacityRequestPayload> & { status?: string },
): Promise<CapacityRequest> {
  return authedRequest<CapacityRequest>(`/api/requests/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRequest(id: number): Promise<void> {
  return authedRequest<void>(`/api/requests/${id}/`, { method: "DELETE" });
}

/** Stage 4B: NL text → sanitized structured suggestion (never persists). */
export function parseRequestText(text: string): Promise<ParseResponse> {
  return authedRequest<ParseResponse>("/api/requests/parse/", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
