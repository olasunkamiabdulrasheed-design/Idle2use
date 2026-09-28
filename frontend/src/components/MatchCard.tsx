/** Marketplace-style match card (reference image: "Top Match Results"). */

import {
  Building2,
  Boxes,
  MapPin,
  Truck,
  User,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Match } from "../types/matches";

const CATEGORY_VISUAL: Record<string, { Icon: LucideIcon; gradient: string }> = {
  space: { Icon: Building2, gradient: "from-indigo-500 to-blue-600" },
  storage: { Icon: Boxes, gradient: "from-amber-500 to-orange-600" },
  transportation: { Icon: Truck, gradient: "from-emerald-500 to-teal-600" },
  equipment: { Icon: Wrench, gradient: "from-rose-500 to-pink-600" },
};

export default function MatchCard({
  match,
  onBook,
  booking = false,
}: {
  match: Match;
  onBook?: (m: Match) => void;
  booking?: boolean;
}) {
  const r = match.resource_detail;
  const visual = CATEGORY_VISUAL[r.category] ?? CATEGORY_VISUAL.space;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        {/* Resource visual */}
        <div
          className={`relative flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${visual.gradient} sm:h-28 sm:w-44`}
        >
          <visual.Icon className="h-10 w-10 text-white/90" strokeWidth={1.5} />
          <span className="absolute top-2 left-2 rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            {match.score}% Match
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 capitalize">
              {r.category}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> {r.location}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {r.capacity} {r.capacity_unit}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {r.owner_username}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                Why this matches
              </p>
              <ul className="mt-1 space-y-0.5">
                {match.reasons.slice(0, 4).map((reason) => (
                  <li key={reason} className="text-xs text-green-700">
                    ✓ {reason}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <button
                type="button"
                onClick={() => onBook?.(match)}
                disabled={booking}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
              >
                {booking ? "Booking…" : "Book this space"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
