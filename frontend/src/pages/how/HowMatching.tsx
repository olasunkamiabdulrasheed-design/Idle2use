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
    <div>
      <HowHero
        title="How matching works"
        subtitle="Idle2Use compares request requirements against available capacity. It is deterministic scoring with hard gates — no guessing."
      />

      {/* Chain */}
      <section className="mt-10">
        <div className="flex flex-col items-center gap-2">
          {CHAIN.map((label, i) => (
            <div key={label} className="contents">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-850 px-4 py-3.5 text-center">
                <p className="text-sm font-bold text-mist-100">
                  {i + 1}. {label}
                </p>
              </div>
              {i < CHAIN.length - 1 && (
                <ArrowDown
                  aria-hidden="true"
                  className="h-5 w-5 text-brand-500/50"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Explanation + hard gates */}
      <section className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
          <h2 className="text-lg font-extrabold text-mist-100">
            First: the hard gates
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist-400">
            A candidate resource has to clear every one of these before it counts
            as a match at all. Fail a single gate and it is skipped outright — it
            never even reaches the scoring stage.
          </p>
          <ul className="mt-5 space-y-3">
            {GATES.map((g) => (
              <li key={g} className="flex items-start gap-2.5 text-sm text-mist-200">
                <Zap
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
          <h2 className="text-lg font-extrabold text-mist-100">
            Then: weighted scoring
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist-400">
            Whatever survives the gates is then scored out of 100, built from
            five weighted factors. The weights below are the real ones — they
            decide the order you see matches in.
          </p>
          <ul className="mt-5 space-y-5">
            {WEIGHTS.map(({ label, pct, note }) => (
              <li key={label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-mist-100">{label}</span>
                  <span className="font-extrabold text-brand-400">{pct}%</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
                  role="img"
                  aria-label={`${label} weight: ${pct} percent`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-mist-500">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* When it runs + reasons */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-500/20 bg-brand-500/[0.06] p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
            <Bell className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-mist-100">
            When matching runs
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist-400">
            Matching is not a nightly job you have to wait for. It re-runs
            whenever something changes on either side:
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mist-300">
            <li>
              <strong className="text-mist-100">When you post a request</strong> —
              every active resource in the right category is scored straight
              away, so your matches are waiting the moment you look.
            </li>
            <li>
              <strong className="text-mist-100">
                When a provider changes capacity
              </strong>{" "}
              — saving a resource or its availability re-checks all active
              requests, so a newly freed slot finds its match immediately
              (synchronous — there is no background queue in this MVP).
            </li>
            <li>
              <strong className="text-mist-100">Notifications</strong> — the
              requester is told about brand-new matches only, so nobody gets
              pinged twice for the same thing.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
          <h2 className="text-lg font-extrabold text-mist-100">
            Every match explains itself
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist-400">
            The score is there to rank your options. The reasons are what tell
            you{" "}
            <em className="text-mist-200 not-italic">why</em> something matched
            — they are generated by the engine itself, not written by hand.
            These are real examples:
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[
              "Location matches exactly",
              "Available Oct 06 10:00-16:00",
              "Capacity is sufficient (40 ≥ 20)",
              "Resource type matches (classroom)",
              "Requirements satisfied",
            ].map((r) => (
              <li
                key={r}
                className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-300"
              >
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-mist-500">
            One thing worth being clear about: AI is only used to turn a
            plain-English request into structured fields. The matching itself is
            deterministic scoring — the same inputs always produce the same
            ranked list.
          </p>
        </div>
      </section>

      {/* Related */}
      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        subtext="Post a request in your own words and watch it come back as a ranked list of resources — each one with the reasons it was chosen."
        to="/register"
        label="Get Started"
      />
    </div>
  );
}
