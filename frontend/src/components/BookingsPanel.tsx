/** Bookings lifecycle + reviews. */

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { friendlyError } from "../api/auth";
import {
  createReview,
  listBookings,
  listReviews,
  updateBooking,
} from "../api/bookings";
import type { Booking, Review } from "../types/bookings";
import Alert from "./ui/Alert";
import Badge, { statusTone } from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Textarea } from "./ui/Field";

function timeOnly(iso: string) {
  return iso.slice(11, 16);
}

export default function BookingsPanel({
  myUserId,
  onBooked,
}: {
  myUserId: number;
  onBooked?: () => void;
}) {
  const [mine, setMine] = useState<Booking[]>([]);
  const [incoming, setIncoming] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [reviewFor, setReviewFor] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [m, p, r] = await Promise.all([
        listBookings(),
        listBookings("provider"),
        listReviews(),
      ]);
      setMine(m);
      setIncoming(p);
      setReviews(r);
      setError("");
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(b: Booking, status: string) {
    try {
      await updateBooking(b.id, { status });
      await refresh();
      onBooked?.();
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }

  async function submitReview() {
    if (reviewFor === null) return;
    try {
      await createReview({ booking: reviewFor, rating, comment: comment.trim() });
      setReviewFor(null);
      setComment("");
      setRating(5);
      await refresh();
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }

  const hasReviewed = (bookingId: number) =>
    reviews.some((r) => r.booking === bookingId);

  function actions(b: Booking) {
    const isProvider = b.provider === myUserId;
    if (b.status === "pending" && isProvider)
      return (
        <>
          <Button size="sm" onClick={() => act(b, "confirmed")}>
            Confirm
          </Button>
          <Button size="sm" variant="danger" onClick={() => act(b, "cancelled")}>
            Decline
          </Button>
        </>
      );
    if (b.status === "pending" && !isProvider)
      return (
        <Button size="sm" variant="danger" onClick={() => act(b, "cancelled")}>
          Cancel
        </Button>
      );
    if (b.status === "confirmed" && isProvider)
      return (
        <>
          <Button size="sm" onClick={() => act(b, "completed")}>
            Complete
          </Button>
          <Button size="sm" variant="danger" onClick={() => act(b, "cancelled")}>
            Cancel
          </Button>
        </>
      );
    if (b.status === "confirmed")
      return (
        <Button size="sm" variant="danger" onClick={() => act(b, "cancelled")}>
          Cancel
        </Button>
      );
    if (b.status === "completed" && !hasReviewed(b.id))
      return (
        <Button size="sm" onClick={() => setReviewFor(b.id)}>
          Leave review
        </Button>
      );
    return null;
  }

  function list(title: string, items: Booking[], empty: string) {
    return (
      <div className="min-w-0">
        <p className="mb-3 text-xs font-bold tracking-wide text-mist-500 uppercase">
          {title}
        </p>
        <ul className="space-y-2.5">
          {items.length === 0 && (
            <li className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-relaxed text-mist-500">
              {empty}
            </li>
          )}
          {items.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-white/10 bg-ink-850 p-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <span className="font-semibold text-mist-100">
                    {b.resource_name}
                  </span>
                  <span className="mt-0.5 block text-xs text-mist-400">
                    {b.date} · {timeOnly(b.start_time)}–{timeOnly(b.end_time)}
                  </span>
                  <span className="mt-1 block text-xs text-mist-500">
                    {b.requester_username} → {b.provider_username}
                    {b.agreed_price ? ` · agreed: ${b.agreed_price}` : ""}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(b.status)} className="capitalize">
                    {b.status}
                  </Badge>
                  {actions(b)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}

      {reviewFor !== null && (
        <Card tone="brand">
          <p className="text-sm font-bold text-mist-100">
            Rate booking #{reviewFor}
          </p>
          <p className="mt-1 text-sm text-mist-400">
            Reviews unlock after a completed booking — one per booking.
          </p>

          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                aria-pressed={rating >= n}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  rating >= n
                    ? "bg-brand-600 text-white"
                    : "border border-white/15 bg-white/[0.04] text-mist-500 hover:text-mist-300"
                }`}
              >
                <Star
                  className="h-4 w-4"
                  fill={rating >= n ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>

          <Textarea
            className="mt-3"
            rows={2}
            placeholder="Comment (optional)"
            aria-label="Review comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={submitReview}>Submit review</Button>
            <Button variant="secondary" onClick={() => setReviewFor(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="grid gap-6 md:grid-cols-2">
          {list(
            "Requests I made",
            mine,
            "You have not booked anyone yet. Find a resource you like, message the provider, and the booking will show up here once it is created.",
          )}
          {list(
            "Requests to my resources",
            incoming,
            "Nobody has booked your resources yet. Keep your availability up to date — requests come through as soon as something you list is matched.",
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-mist-100">Reviews received</h2>
        <ul className="mt-4 space-y-2.5">
          {reviews.length === 0 && (
            <li className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-relaxed text-mist-500">
              No reviews yet. Once a booking is marked complete, whoever you
              dealt with can leave you one — and their words will show up here.
            </li>
          )}
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-white/10 bg-ink-850 p-3.5 text-sm"
            >
              <span
                className="text-warn-400"
                aria-label={`${r.rating} out of 5`}
              >
                {"★".repeat(r.rating)}
                <span className="text-mist-500">{"☆".repeat(5 - r.rating)}</span>
              </span>{" "}
              <span className="text-mist-400">
                {r.reviewer_username} → {r.reviewee_username}
              </span>
              {r.comment && (
                <p className="mt-1.5 text-mist-200">{r.comment}</p>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
