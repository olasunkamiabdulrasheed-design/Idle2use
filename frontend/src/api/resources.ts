/**
 * Stage 3 resources API layer — all Resource/Availability HTTP calls.
 *
 * Same architecture as auth.ts: React talks ONLY to Django HTTP endpoints
 * (with the JWT Bearer token); Django owns validation, ownership checks,
 * overlap detection, and the database. ApiError + token helpers are reused
 * from auth.ts instead of being duplicated.
 */

import type { ApiErrorData } from "../types/auth";
import type {
  Availability,
  AvailabilityPayload,
  Resource,
  ResourceFilters,
  ResourcePayload,
} from "../types/resources";
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

function filterQuery(filters: ResourceFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.location) params.set("location", filters.location);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

// -- Resources -----------------------------------------------------------

export function listResources(filters: ResourceFilters = {}): Promise<Resource[]> {
  return authedRequest<Resource[]>(`/api/resources/${filterQuery(filters)}`);
}

export function createResource(payload: ResourcePayload): Promise<Resource> {
  return authedRequest<Resource>("/api/resources/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateResource(
  id: number,
  payload: Partial<ResourcePayload>,
): Promise<Resource> {
  return authedRequest<Resource>(`/api/resources/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteResource(id: number): Promise<void> {
  return authedRequest<void>(`/api/resources/${id}/`, { method: "DELETE" });
}

// -- Availability ----------------------------------------------------------

export function listAvailability(resourceId: number): Promise<Availability[]> {
  return authedRequest<Availability[]>(`/api/resources/${resourceId}/availability/`);
}

export function createAvailability(
  resourceId: number,
  payload: AvailabilityPayload,
): Promise<Availability> {
  return authedRequest<Availability>(`/api/resources/${resourceId}/availability/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAvailability(
  id: number,
  payload: Partial<AvailabilityPayload>,
): Promise<Availability> {
  return authedRequest<Availability>(`/api/availability/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAvailability(id: number): Promise<void> {
  return authedRequest<void>(`/api/availability/${id}/`, { method: "DELETE" });
}
