/** Stage 7: in-app notifications API. */

import type { Notification } from "../types/notifications";
import { authedRequest } from "./client";

export function listNotifications(): Promise<Notification[]> {
  return authedRequest("/api/notifications/");
}

export function markNotificationRead(id: number): Promise<Notification> {
  return authedRequest(`/api/notifications/${id}/read/`, { method: "POST" });
}

export function markAllNotificationsRead(): Promise<void> {
  return authedRequest("/api/notifications/read-all/", { method: "POST" });
}
