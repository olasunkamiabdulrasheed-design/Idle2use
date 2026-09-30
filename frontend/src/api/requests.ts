/**
 * Stage 4 capacity requests API layer — all "I NEED CAPACITY" HTTP calls.
 * React talks only to Django; Django owns validation, ownership, and storage.
 * Reuses the ApiError/token helpers from auth.ts (single HTTP layer).
 */

import type {
  CapacityRequest,
  CapacityRequestPayload,
  ParseResponse,
  RequestFilters,
} from "../types/requests";
import { authedRequest } from "./client";

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

/** Stage 5B: run the matching engine for a request and return results. */
export function runMatching(requestId: number): Promise<import("../types/matches").Match[]> {
  return authedRequest(`/api/requests/${requestId}/matches/`, { method: "POST" });
}

export function getMatches(requestId: number): Promise<import("../types/matches").Match[]> {
  return authedRequest(`/api/requests/${requestId}/matches/`);
}
