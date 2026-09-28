/**
 * Requester/Provider dashboard (reference image layout):
 * greeting → stat cards → AI request composer → top match results,
 * with a right column of recent notifications + upcoming bookings.
 */

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  CalendarClock,
  ClipboardList,
  MessagesSquare,
  Search,
  Target,
} from "lucide-react";
import { formatApiError } from "../api/auth";
import { listBookings, createBooking } from "../api/bookings";
import { getDashboard } from "../api/dashboard";
import { listNotifications } from "../api/notifications";
import {
  createRequest,
  parseRequestText,
  runMatching,
} from "../api/requests";
import type { Notification } from "../types/notifications";
import type { Booking, DashboardStats } from "../types/bookings";
import type { Match } from "../types/matches";
import MatchCard from "./MatchCard";

const CATEGORY_CHIPS = [
  { label: "Spaces & Venues", value: "space" },
  { label: "Storage", value: "storage" },
  { label: "Transportation", value: "transportation" },
  { label: "Equipment", value: "equipment" },
] as const;

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPanel({
  onRequestCreated,
}: {
  onRequestCreated?: () => void;
}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // AI composer state.
  const [nlText, setNlText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [notice, setNotice] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [bookingMatch, setBookingMatch] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, n, b] = await Promise.all([
        getDashboard(),
        listNotifications(),
        listBookings(),
      ]);
      setStats(s);
      setNotifications(n.slice(0, 6));
      setBookings(b.filter((x) => x.status !== "cancelled").slice(0, 4));
      setError("");
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** NL → parse (AI) → create request → run matching → show results. */
  async function handleFindMatches(e: React.FormEvent) {
    e.preventDefault();
    if (!nlText.trim() || parsing) return;
    setParsing(true);
    setError("");
    setNotice("");
    try {
      const parsed = await parseRequestText(nlText.trim());
      const s = parsed.suggestion;
      const created = await createRequest({
        category: s.category ?? "space",
        resource_type: s.resource_type ?? "",
        location: s.location ?? "",
        capacity_required: s.capacity_required ?? 1,
        date: s.date ?? new Date().toISOString().slice(0, 10),
        start_time: s.start_time ?? "09:00",
        end_time: s.end_time ?? "17:00",
        purpose: s.purpose ?? "",
        requirements: s.requirements ?? "",
        original_text: parsed.original_text,
      });
      const found = await runMatching(created.id);
      setMatches(found);
      setNotice(
        found.length
          ? `Found ${found.length} match${found.length === 1 ? "" : "es"} for your request #${created.id}.`
          : `Request #${created.id} created — no strong matches yet. We'll match it when capacity appears.`,
      );
      setNlText("");
      refresh();
      onRequestCreated?.();
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setParsing(false);
    }
  }

  async function handleBook(m: Match) {
    setBookingMatch(m.id);
    setError("");
    try {
      const booking = await createBooking({
        request: m.request,
        resource: m.resource,
      });
      setNotice(
        `Booking #${booking.id} requested with ${m.resource_detail.name} — track it in Bookings.`,
      );
      setMatches((prev) => prev.filter((x) => x.id !== m.id));
      refresh();
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setBookingMatch(null);
    }
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {greeting}
          </h1>
          <p className="text-sm text-slate-500">
            Here's what's happening with your capacity requests.
          </p>
        </div>

        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard icon={<ClipboardList className="h-5 w-5" />} label="Active Requests" value={stats.active_requests} />
            <StatCard icon={<Target className="h-5 w-5" />} label="Matches Found" value={stats.new_matches} />
            <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Upcoming Bookings" value={stats.upcoming_bookings} />
            <StatCard icon={<MessagesSquare className="h-5 w-5" />} label="Total Messages" value={stats.conversations} />
          </div>
        )}

        {/* AI request composer */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Describe what you need
                </h2>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                  AI Powered
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Use natural language — our AI structures your request and finds
                the best matches.
              </p>
            </div>
          </div>

          <form onSubmit={handleFindMatches} className="mt-4">
            <textarea
              className="w-full resize-none rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-green-600 focus:ring-2 focus:ring-green-100 focus:outline-none"
              rows={2}
              placeholder="e.g. I need a classroom or hall for 30 people in Ikeja tomorrow from 10am to 4pm"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_CHIPS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setNlText((t) =>
                      t.includes(c.label) ? t : `${t.trim()} ${c.label}`.trim(),
                    )
                  }
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-green-600 hover:text-green-700"
                >
                  + {c.label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={parsing || !nlText.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {parsing ? "Parsing with AI…" : "Find Matches"}
            </button>
          </form>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {notice}
            </p>
          )}
        </section>

        {/* Top match results */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Top Match Results
            </h2>
          </div>
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading your dashboard…
            </div>
          )}
          {!loading && matches.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              No matches yet — describe what you need above and our AI will
              search available capacity.
            </div>
          )}
          <div className="space-y-3">
            {matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onBook={handleBook}
                booking={bookingMatch === m.id}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Right column */}
      <aside className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Recent Notifications
            </h2>
            <span className="text-xs font-semibold text-green-700">
              {notifications.filter((n) => !n.is_read).length} new
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {notifications.length === 0 && (
              <li className="text-xs text-slate-400">Nothing yet.</li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-2 rounded-xl border border-slate-100 p-2.5 ${
                  n.is_read ? "opacity-60" : "bg-green-50/50"
                }`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="truncate text-[11px] text-slate-500">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">
            Upcoming Bookings
          </h2>
          <ul className="mt-3 space-y-2">
            {bookings.length === 0 && (
              <li className="text-xs text-slate-400">
                No upcoming bookings.
              </li>
            )}
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {b.resource_name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {b.date} · {b.start_time.slice(0, 5)}–
                    {b.end_time.slice(0, 5)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    b.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : b.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : b.status === "completed"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
