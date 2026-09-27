/** Stage 9/10: bookings + reviews API. */

import type { Booking, BookingPayload, Review } from "../types/bookings";
import { authedRequest } from "./client";

export function listBookings(role?: "provider"): Promise<Booking[]> {
  const query = role === "provider" ? "?role=provider" : "";
  return authedRequest(`/api/bookings/${query}`);
}

export function createBooking(payload: BookingPayload): Promise<Booking> {
  return authedRequest("/api/bookings/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBooking(
  id: number,
  payload: Partial<BookingPayload> & { status?: string },
): Promise<Booking> {
  return authedRequest(`/api/bookings/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listReviews(userId?: number): Promise<Review[]> {
  const query = userId ? `?user=${userId}` : "";
  return authedRequest(`/api/reviews/${query}`);
}

export function createReview(payload: {
  booking: number;
  rating: number;
  comment?: string;
}): Promise<Review> {
  return authedRequest("/api/reviews/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
