/** Stage 4 capacity request types: shapes exchanged with the Django API. */

export type RequestCategory =
  | "transportation"
  | "storage"
  | "space"
  | "equipment";

export type RequestStatus =
  | "active"
  | "matched"
  | "fulfilled"
  | "cancelled"
  | "expired";

export interface CapacityRequest {
  id: number;
  requester: number;
  requester_username: string;
  category: RequestCategory;
  resource_type: string;
  location: string;
  capacity_required: number;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  requirements: string;
  status: RequestStatus;
  original_text: string;
  structured_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CapacityRequestPayload {
  category: RequestCategory;
  resource_type?: string;
  location: string;
  capacity_required: number;
  date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  requirements?: string;
  original_text?: string;
}

export interface RequestFilters {
  status?: string;
}

/** Stage 4B: POST /api/requests/parse/ response. */
export interface ParseResponse {
  original_text: string;
  suggestion: Partial<CapacityRequest>;
  warnings: string[];
  parser: "ai" | "fallback" | null;
}
