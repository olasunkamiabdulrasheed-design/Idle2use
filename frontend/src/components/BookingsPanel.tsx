/** Stage 9/10: bookings lifecycle + reviews. */

import { useCallback, useEffect, useState } from "react";
import { friendlyError } from "../api/auth";
import {
  createReview,
  listBookings,
  listReviews,
  updateBooking,
} from "../api/bookings";
import type { Booking, Review } from "../types/bookings";

const STATUS_STYLES: Record<Booking["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

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
          <Btn green onClick={() => act(b, "confirmed")}>Confirm</Btn>
          <Btn red onClick={() => act(b, "cancelled")}>Decline</Btn>
        </>
      );
    if (b.status === "pending" && !isProvider)
      return <Btn red onClick={() => act(b, "cancelled")}>Cancel</Btn>;
    if (b.status === "confirmed" && isProvider)
      return (
        <>
          <Btn green onClick={() => act(b, "completed")}>Complete</Btn>
          <Btn red onClick={() => act(b, "cancelled")}>Cancel</Btn>
        </>
      );
    if (b.status === "confirmed")
      return <Btn red onClick={() => act(b, "cancelled")}>Cancel</Btn>;
    if (b.status === "completed" && !hasReviewed(b.id))
      return (
        <Btn green onClick={() => setReviewFor(b.id)}>Leave review</Btn>
      );
    return null;
  }

  function list(title: string, items: Booking[]) {
    return (
      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
          {title}
        </p>
        <ul className="space-y-2">
          {items.length === 0 && (
            <li className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
              Nothing here yet.
            </li>
          )}
          {items.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="text-sm">
                <span className="font-semibold text-slate-900">
                  {b.resource_name}
                </span>{" "}
                <span className="text-slate-500">· {b.date}</span>
                <span className="text-slate-500">
                  {" "}
                  {timeOnly(b.start_time)}–{timeOnly(b.end_time)}
                </span>
                <span className="block text-xs text-slate-500">
                  {b.requester_username} → {b.provider_username}
                  {b.agreed_price ? ` · agreed: ${b.agreed_price}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[b.status]}`}
                >
                  {b.status}
                </span>
                {actions(b)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Bookings & Reviews
      </p>
      <h2 className="text-lg font-bold text-slate-900">Bookings</h2>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {reviewFor !== null && (
        <div className="mt-4 rounded-xl border border-green-700 p-4">
          <p className="text-sm font-bold text-slate-900">Rate this booking</p>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`h-8 w-8 rounded-lg text-sm font-bold ${
                  rating >= n
                    ? "bg-green-700 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
            rows={2}
            placeholder="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={submitReview}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Submit review
            </button>
            <button
              type="button"
              onClick={() => setReviewFor(null)}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {list("Requests I made", mine)}
        {list("Requests to my resources", incoming)}
      </div>

      <p className="mt-6 mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
        Reviews received
      </p>
      <ul className="space-y-2">
        {reviews.length === 0 && (
          <li className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            No reviews yet — complete a booking first.
          </li>
        )}
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-slate-200 p-3 text-sm"
          >
            <span className="font-bold text-slate-900">
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
            </span>{" "}
            <span className="text-slate-600">
              {r.reviewer_username} → {r.reviewee_username}
            </span>
            {r.comment && <p className="text-slate-800">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Btn({
  children,
  onClick,
  green,
}: {
  children: string;
  onClick: () => void;
  green?: boolean;
  red?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
        green ? "bg-green-700" : "bg-red-600"
      }`}
    >
      {children}
    </button>
  );
}
