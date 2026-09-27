/** Stage 6: dashboard overview counters. */

import type { DashboardStats } from "../types/bookings";
import { authedRequest } from "./client";

export function getDashboard(): Promise<DashboardStats> {
  return authedRequest("/api/dashboard/");
}
