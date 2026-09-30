/** /how-it-works/request — the requester journey with a real example. */

import { Boxes, MessageSquare, PenLine, Search, Sparkles, Star } from "lucide-react";
import { useAuth } from "../../authContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CtaBand, FlowRow, HowHero, NavCard, StepRow } from "./shared";

const STEPS = [
  {
    icon: PenLine,
    title: "Describe your requirement",
    desc: "Type what you need in plain English — no forms to fill first.",
  },
  {
    icon: PenLine,
    title: "Add important details",
    desc: "Review the structured fields the parser extracts and adjust anything that is off.",
  },
  {
    icon: Search,
    title: "Review matching resources",
    desc: "Matching runs automatically against active resources of the right category.",
  },
  {
    icon: Star,
    title: "Compare options",
    desc: "Each match shows a score out of 100 plus the reasons it matched.",
  },
  {
    icon: MessageSquare,
    title: "Connect or book",
    desc: "Message the provider, then create a booking that both sides confirm.",
  },
];

const PARSED: [string, string][] = [
  ["Category", "Spaces & Venues"],
  ["Resource type", "classroom"],
  ["Location", "Ikeja"],
  ["Capacity", "20"],
  ["Date", "2026-10-06"],
  ["Time window", "10:00 – 16:00"],
];

const REASONS = [
  "Location matches exactly",
  "Available Oct 06 10:00-16:00",
  "Capacity is sufficient",
  "Resource type matches (classroom)",
  "Requirements satisfied",
];

export default function HowRequest() {
  const { user } = useAuth();
  usePageTitle("Find Capacity");

  return (
    <div className="pb-4">
      <HowHero
        title="Need capacity? Start with what you need."
        subtitle="One sentence is enough to get started. Here is the requester journey from first words to a booked exchange."
      />

      {/* Steps */}
      <ol className="mt-8 grid gap-3">
        {STEPS.map((s, i) => (
          <StepRow key={s.title} n={i + 1} title={s.title} desc={s.desc} />
        ))}
      </ol>

      {/* Visual: example moving through the platform */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          See it move through the platform
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          A real example sentence, parsed by the request parser (AI when
          configured, deterministic fallback otherwise) and sanitized before
          anything is stored.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 1. The words */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs font-bold tracking-widest text-green-400 uppercase">
              1 · Your words
            </span>
            <p className="mt-3 rounded-xl rounded-tl-none bg-green-600/15 p-4 text-sm leading-relaxed text-white">
              “I need a classroom for 20 people in Ikeja tomorrow from
              10am–4pm.”
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Sent to <code className="text-green-400">POST /api/requests/parse/</code> —
              the suggestion is never persisted until you confirm it.
            </p>
          </div>

          {/* 2. Structured request */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs font-bold tracking-widest text-green-400 uppercase">
              2 · Structured request
            </span>
            <dl className="mt-3 space-y-2 text-sm">
              {PARSED.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 border-b border-white/5 pb-1.5"
                >
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="font-semibold break-words text-right text-white">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-slate-400">
              Invalid or unknown fields are dropped by the sanitizer before the
              request is created.
            </p>
          </div>

          {/* 3. Scored matches */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs font-bold tracking-widest text-green-400 uppercase">
              3 · Scored matches
            </span>
            <ul className="mt-3 flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <li
                  key={r}
                  className="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300"
                >
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-400">
              Every surviving match gets a score out of 100 and human-readable
              reasons — shown on your Find Capacity page.
            </p>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          The journey at a glance
        </h2>
        <div className="mt-5">
          <FlowRow
            items={[
              "Plain-English request",
              "Parsed + stored",
              "Auto-matched",
              "Compare",
              "Book",
            ]}
          />
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NavCard
          to="/how-it-works/matching"
          Icon={Sparkles}
          title="How Matching Works"
          desc="Hard gates, five weighted factors, and where the numbers come from."
        />
        <NavCard
          to="/how-it-works/provider"
          Icon={Boxes}
          title="For Capacity Providers"
          desc="The other side: list what you have and get found by requests like this."
        />
      </section>

      <CtaBand
        text="Ready to describe what you need?"
        to={user ? "/app/find" : "/register"}
        label={user ? "Find Capacity" : "Get Started"}
      />
    </div>
  );
}
