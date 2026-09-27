/** Stage 3 resource types: shapes exchanged with the Django API. */

export type ResourceCategory =
  | "transportation"
  | "storage"
  | "space"
  | "equipment";

export type ResourceStatus = "active" | "inactive";

export type AvailabilityStatus = "available" | "unavailable";

export interface Resource {
  id: number;
  owner: number;
  owner_username: string;
  category: ResourceCategory;
  name: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  capacity_unit: string;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

export interface ResourcePayload {
  category: ResourceCategory;
  name: string;
  description?: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity: number;
  capacity_unit: string;
  status?: ResourceStatus;
}

export interface Availability {
  id: number;
  resource: number;
  date: string;
  start_time: string;
  end_time: string;
  status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityPayload {
  date: string;
  start_time: string;
  end_time: string;
  status?: AvailabilityStatus;
}

export interface ResourceFilters {
  category?: string;
  location?: string;
  status?: string;
}
