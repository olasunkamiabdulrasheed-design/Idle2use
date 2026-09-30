/** /how-it-works/matching — visual explanation of the real scoring engine
 * (backend/matches/services.py). No invented capabilities: everything here
 * mirrors the implemented gates, weights and triggers. */

import { ArrowDown, Bell, Zap } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CtaBand, HowHero, NavCard } from "./shared";

const CHAIN = [
  "Request",
  "Requirements",
  "Available capacity",
  "Match scoring",
  "Relevant matches",
];

const GATES = [
  "The resource is active",
  "Category matches exactly",
  "An available slot covers the requested date AND time window",
  "Capacity ≥ capacity required",
];

const WEIGHTS: { label: string; pct: number; note: string }[] = [
  { label: "Location", pct: 30, note: "Exact or partial location overlap" },
  {
    label: "Time",
    pct: 25,
    note: "Availability slot covers the full requested window",
  },
  { label: "Capacity", pct: 20, note: "Resource capacity vs. requested capacity" },
  {
    label: "Resource type",
    pct: 15,
    note: "Type mentioned in the request vs. the resource listing",
  },
  { label: "Requirements", pct: 10, note: "Free-text requirements vs. the listing" },
];

export default function HowMatching() {
  usePageTitle("Matching");

  return (
    <div className="pb-4">
      <HowHero
        title="How matching works"
        subtitle="Idle2Use compares request requirements against available capacity. It is deterministic scoring with hard gates — no guessing."
      />

      {/* Chain */}
      <section className="mt-8">
        <div className="flex flex-col items-center gap-2">
          {CHAIN.map((label, i) => (
            <div key={label} className="contents">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-center">
                <p className="text-sm font-bold text-white">
                  {i + 1}. {label}
                </p>
              </div>
              {i < CHAIN.length - 1 && (
                <ArrowDown
                  aria-hidden="true"
                  className="h-5 w-5 text-green-500/60"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Explanation + hard gates */}
      <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-white">
            First: the hard gates
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A candidate resource must pass every gate to become a match at all.
            Failing any gate means it is skipped — it never gets a score.
          </p>
          <ul className="mt-4 space-y-2.5">
            {GATES.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-slate-300">
                <Zap
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-white">
            Then: weighted scoring
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Surviving candidates get a score out of 100 built from five factors:
          </p>
          <ul className="mt-4 space-y-4">
            {WEIGHTS.map(({ label, pct, note }) => (
              <li key={label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-white">{label}</span>
                  <span className="font-extrabold text-green-400">{pct}%</span>
                </div>
                <div
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
                  role="img"
                  aria-label={`${label} weight: ${pct} percent`}
                >
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* When it runs + reasons */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/20 text-green-400">
            <Bell className="h-5 w-5" />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-white">
            When matching runs
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>
              <strong className="text-white">When you post a request</strong> —
              active resources of the right category are scored immediately.
            </li>
            <li>
              <strong className="text-white">When a provider changes capacity</strong> —
              saving a resource or availability re-checks all active requests
              (synchronous — no background queue in this MVP).
            </li>
            <li>
              <strong className="text-white">Notifications</strong> — the
              requester is notified about brand-new matches only.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-white">
            Every match explains itself
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Scores are for ranking; the reasons are the source of truth about{" "}
            <em className="text-slate-300 not-italic">why</em> something matched.
            Examples straight from the engine:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              "Location matches exactly",
              "Available Oct 06 10:00-16:00",
              "Capacity is sufficient (40 ≥ 20)",
              "Resource type matches (classroom)",
              "Requirements satisfied",
            ].map((r) => (
              <li
                key={r}
                className="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300"
              >
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-400">
            Note: AI is used to parse plain-English requests into structure —
            matching itself is deterministic scoring.
          </p>
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NavCard
          to="/how-it-works/request"
          Icon={ArrowDown}
          title="For People Who Need Capacity"
          desc="How a request is described, parsed and matched."
        />
        <NavCard
          to="/how-it-works/trust"
          Icon={Zap}
          title="Trust & Reliability"
          desc="The access, booking and review rules the API enforces."
        />
      </section>

      <CtaBand
        text="See matching in action"
        to="/register"
        label="Get Started"
      />
    </div>
  );
}
