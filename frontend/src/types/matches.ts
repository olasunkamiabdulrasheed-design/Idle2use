/** Stage 5B: match results. */

import type { CapacityRequest } from "./requests";
import type { Resource } from "./resources";

export interface Match {
  id: number;
  request: number;
  request_detail: CapacityRequest;
  resource: number;
  resource_detail: Resource;
  score: number;
  reasons: string[];
  status: "new" | "viewed" | "dismissed";
  created_at: string;
  updated_at: string;
}
