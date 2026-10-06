/** Match result card — resource summary, match score and the reasons why. */

import { Check, MapPin, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Building2, Boxes, Truck, Wrench } from "lucide-react";
import type { Match } from "../types/matches";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const CATEGORY_VISUAL: Record<string, { Icon: LucideIcon; gradient: string }> = {
  space: { Icon: Building2, gradient: "from-indigo-500 to-blue-600" },
  storage: { Icon: Boxes, gradient: "from-amber-500 to-orange-600" },
  transportation: { Icon: Truck, gradient: "from-emerald-500 to-teal-600" },
  equipment: { Icon: Wrench, gradient: "from-rose-500 to-pink-600" },
};

/** Renders the 0–100 score with a colour that reflects its strength. */
function scoreTone(score: number) {
  if (score >= 75) return "border-brand-400/40 bg-brand-500/20 text-brand-300";
  if (score >= 50) return "border-warn-400/40 bg-warn-400/20 text-warn-300";
  return "border-white/20 bg-white/10 text-mist-200";
}

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
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition-colors hover:border-white/20">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5">
        {/* Resource visual */}
        <div
          className={`relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${visual.gradient} sm:h-28 sm:w-44`}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_55%)]"
          />
          <visual.Icon className="relative h-10 w-10 text-white/90" strokeWidth={1.5} />
          <span
            className={`absolute top-2 left-2 rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm ${scoreTone(match.score)}`}
          >
            {match.score}% match
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-mist-100">{r.name}</h3>
            <Badge tone="muted" className="capitalize">
              {r.category}
            </Badge>
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-mist-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {r.location}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist-300">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" /> {r.capacity}{" "}
              {r.capacity_unit}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0" /> {r.owner_username}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-wide text-mist-500 uppercase">
                Why this matches
              </p>
              <ul className="mt-2 space-y-1">
                {match.reasons.slice(0, 4).map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-1.5 text-xs text-mist-300"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {onBook && (
              <Button
                onClick={() => onBook(match)}
                disabled={booking}
                size="sm"
                className="w-full sm:w-auto"
              >
                {booking ? "Booking…" : "Book this capacity"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
