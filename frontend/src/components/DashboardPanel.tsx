/** Requester/Provider dashboard: greeting → stat cards → AI request composer
 * → top match results, with a right column of recent notifications +
 * upcoming bookings. */

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ClipboardList,
  MessagesSquare,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { friendlyError } from "../api/auth";
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
import Alert from "./ui/Alert";
import Badge, { statusTone } from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import StatCard from "./ui/StatCard";
import { Textarea } from "./ui/Field";

const CATEGORY_CHIPS = [
  { label: "Spaces & Venues", value: "space" },
  { label: "Storage", value: "storage" },
  { label: "Transportation", value: "transportation" },
  { label: "Equipment", value: "equipment" },
] as const;

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card padded={false} className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-mist-100">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export default function DashboardPanel({
  onRequestCreated,
  username,
}: {
  onRequestCreated?: () => void;
  username?: string;
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
  const [aiParsed, setAiParsed] = useState<boolean | null>(null);
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
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** NL → parse → create request → run matching → show results. */
  async function handleFindMatches(e: React.FormEvent) {
    e.preventDefault();
    if (!nlText.trim() || parsing) return;
    setParsing(true);
    setError("");
    setNotice("");
    try {
      const parsed = await parseRequestText(nlText.trim());
      // The backend reports which engine produced the suggestion ("ai" when
      // an AI key is configured, deterministic "fallback" otherwise).
      setAiParsed(parsed.parser === "ai");
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
      setError(friendlyError(err));
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
      setError(friendlyError(err));
    } finally {
      setBookingMatch(null);
    }
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-extrabold break-words text-mist-100 sm:text-3xl">
            {greeting}
            {username ? `, ${username}` : ""}
          </h1>
          <p className="mt-1 text-sm text-mist-400">
            Here's what's happening with your capacity.
          </p>
        </div>

        {/* Stat cards — real API data, 0 when there is none yet */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="Requests"
            value={stats?.active_requests ?? 0}
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Matches"
            value={stats?.new_matches ?? 0}
          />
          <StatCard
            icon={<CalendarClock className="h-5 w-5" />}
            label="Bookings"
            value={stats?.upcoming_bookings ?? 0}
          />
          <StatCard
            icon={<MessagesSquare className="h-5 w-5" />}
            label="Messages"
            value={stats?.conversations ?? 0}
          />
        </div>

        {/* Request composer */}
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-mist-100">
              Describe what you need
            </h2>
            {aiParsed && (
              <Badge tone="brand">
                <Sparkles className="h-3 w-3" /> AI parsed
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-mist-400">
            Plain English in — a structured, matched request out.
          </p>

          <form onSubmit={handleFindMatches} className="mt-4">
            <label htmlFor="dash-nl" className="sr-only">
              What capacity do you need?
            </label>
            <Textarea
              id="dash-nl"
              rows={3}
              placeholder="e.g. I need a classroom or hall for 30 people in Ikeja tomorrow from 10am to 4pm"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORY_CHIPS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setNlText((t) =>
                      t.includes(c.label) ? t : `${t.trim()} ${c.label}`.trim(),
                    )
                  }
                  className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-mist-300 transition-colors hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-300"
                >
                  + {c.label}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              disabled={parsing || !nlText.trim()}
              fullWidth
              className="mt-4"
            >
              <Search className="h-4 w-4" />
              {parsing ? "Finding matches…" : "Find matches"}
            </Button>
          </form>

          {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
          {notice && <Alert tone="success" className="mt-4">{notice}</Alert>}
        </Card>

        {/* Top match results */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-mist-100">
              Top match results
            </h2>
            {matches.length > 0 && (
              <Badge tone="muted">{matches.length} found</Badge>
            )}
          </div>

          {loading && (
            <Card className="text-sm text-mist-400">
              Loading your dashboard…
            </Card>
          )}

          {!loading && matches.length === 0 && (
            <Card
              tone="outline"
              className="border-dashed text-center"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-400">
                <Search className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-mist-100">
                No matches yet
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-mist-400">
                Nothing has been matched to you yet. Describe what you need
                above and matching will start scoring available capacity against
                it right away.
              </p>
              <Link
                to="/app/find"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-bold text-mist-100 transition-colors hover:bg-white/[0.08]"
              >
                <Search className="h-4 w-4" /> Browse Find Capacity
              </Link>
            </Card>
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
      <aside className="min-w-0 space-y-6">
        <Panel
          title="Recent notifications"
          action={
            notifications.filter((n) => !n.is_read).length > 0 ? (
              <Badge tone="brand">
                {notifications.filter((n) => !n.is_read).length} new
              </Badge>
            ) : null
          }
        >
          <ul className="mt-3 space-y-2">
            {notifications.length === 0 && (
              <li className="text-xs leading-relaxed text-mist-500">
                Nothing yet — new matches, replies and booking updates will land
                here.
              </li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-2.5 rounded-xl border border-white/5 p-3 ${
                  n.is_read ? "opacity-55" : "bg-brand-500/[0.07]"
                }`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-mist-100">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="truncate text-[11px] text-mist-400">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-mist-500">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Upcoming bookings"
          action={
            <Link
              to="/app/bookings"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 transition-colors hover:text-brand-300"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <ul className="mt-3 space-y-2">
            {bookings.length === 0 && (
              <li className="text-xs leading-relaxed text-mist-500">
                No upcoming bookings. Once a match turns into a confirmed
                booking, it will appear here.
              </li>
            )}
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/5 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-mist-100">
                    {b.resource_name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-mist-400">
                    {b.date} · {b.start_time.slice(0, 5)}–
                    {b.end_time.slice(0, 5)}
                  </p>
                </div>
                <Badge tone={statusTone(b.status)} className="capitalize">
                  {b.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </aside>
    </div>
  );
}
