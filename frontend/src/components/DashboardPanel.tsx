/** Stage 6: real overview counters from GET /api/dashboard/. */

import { useCallback, useEffect, useState } from "react";
import { formatApiError } from "../api/auth";
import { getDashboard } from "../api/dashboard";
import type { DashboardStats } from "../types/bookings";

function Card({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "green" | "red";
}) {
  const tones = {
    slate: "bg-slate-900 text-white",
    green: "bg-green-700 text-white",
    red: "bg-white text-red-700 border border-red-200",
  } as const;
  return (
    <div className={`rounded-xl p-4 ${tones[tone]}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-90">{label}</p>
    </div>
  );
}

export default function DashboardPanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await getDashboard());
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

  return (
    <section className="rounded-2xl bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Stage 6 · Dashboard
          </p>
          <h2 className="text-lg font-bold text-slate-900">
            Your capacity exchange overview
          </h2>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {stats && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
              As a requester
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card label="Active requests" value={stats.active_requests} tone="slate" />
              <Card
                label="New matches"
                value={stats.new_matches}
                tone={stats.new_matches > 0 ? "green" : "slate"}
              />
              <Card label="Upcoming bookings" value={stats.upcoming_bookings} tone="slate" />
              <Card
                label="Unread messages"
                value={stats.unread_messages}
                tone={stats.unread_messages > 0 ? "red" : "slate"}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
              As a provider
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card label="My resources" value={stats.my_resources} tone="slate" />
              <Card
                label="Incoming matches"
                value={stats.incoming_matches}
                tone={stats.incoming_matches > 0 ? "green" : "slate"}
              />
              <Card label="Incoming bookings" value={stats.provider_bookings} tone="slate" />
              <Card
                label="Unread notifications"
                value={stats.unread_notifications}
                tone={stats.unread_notifications > 0 ? "red" : "slate"}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
