/** /how-it-works/request — the requester journey with a real example. */

import { Boxes, MessageSquare, PenLine, Search, Sparkles, Star } from "lucide-react";
import { useAuth } from "../../authContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CtaBand, FlowRow, HowHero, NavCard, StepRow } from "./shared";

const STEPS = [
  {
    icon: PenLine,
    title: "Describe your requirement",
    desc: "Type what you need in your own words — the kind of space or equipment, roughly where, roughly when, and how many people or how much it has to hold. There is no form to fill in first.",
  },
  {
    icon: PenLine,
    title: "Add the important details",
    desc: "The parser turns your sentence into structured fields. Read them back, correct anything it read wrong, and only then confirm — nothing is saved until you do.",
  },
  {
    icon: Search,
    title: "Review matching resources",
    desc: "Matching runs the moment your request exists, checking it against every active resource in the right category and keeping only the ones that actually fit.",
  },
  {
    icon: Star,
    title: "Compare your options",
    desc: "Each match carries a score out of 100 and the plain-English reasons behind it, so you can see at a glance why one is a better fit than another.",
  },
  {
    icon: MessageSquare,
    title: "Connect or book",
    desc: "Message the provider to check anything the listing does not answer, then create a booking. Both sides confirm, and the whole thing is tracked from there.",
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
    <div>
      <HowHero
        title="Need capacity? Start with what you need."
        subtitle="One sentence is enough to get started. Here is the requester journey from first words to a booked exchange."
      />

      {/* Steps */}
      <ol className="mt-10 grid gap-3">
        {STEPS.map((s, i) => (
          <StepRow key={s.title} n={i + 1} title={s.title} desc={s.desc} />
        ))}
      </ol>

      {/* Visual: example moving through the platform */}
      <section className="mt-16">
        <h2 className="text-2xl font-extrabold text-mist-100 sm:text-3xl">
          See it move through the platform
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist-400">
          A single sentence is enough to begin. This is exactly what happens to
          one — parsed by the request parser (AI when it is configured, a
          deterministic fallback when it is not) and sanitized before any of it
          is stored.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 1. The words */}
          <div className="rounded-2xl border border-white/10 bg-ink-800 p-5">
            <span className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              1 · Your words
            </span>
            <p className="mt-4 rounded-2xl rounded-tl-none border border-brand-500/20 bg-brand-500/10 p-4 text-sm leading-relaxed text-mist-100">
              "I need a classroom for 20 people in Ikeja tomorrow from
              10am–4pm."
            </p>
            <p className="mt-4 text-xs leading-relaxed text-mist-500">
              This is how you would type it. The suggestion the parser returns
              is never stored until you have looked it over and confirmed it.
            </p>
          </div>

          {/* 2. Structured request */}
          <div className="rounded-2xl border border-white/10 bg-ink-800 p-5">
            <span className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              2 · Structured request
            </span>
            <dl className="mt-4 space-y-2.5 text-sm">
              {PARSED.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 border-b border-white/5 pb-2 last:border-b-0"
                >
                  <dt className="text-mist-400">{k}</dt>
                  <dd className="font-semibold break-words text-right text-mist-100">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-mist-500">
              The six fields matching actually depends on. Anything invalid or
              unknown is dropped before the request is created.
            </p>
          </div>

          {/* 3. Scored matches */}
          <div className="rounded-2xl border border-white/10 bg-ink-800 p-5">
            <span className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              3 · Scored matches
            </span>
            <ul className="mt-4 flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <li
                  key={r}
                  className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-300"
                >
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-mist-500">
              Every surviving match gets a score out of 100 and human-readable
              reasons — shown on your Find Capacity page.
            </p>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="mt-16">
        <h2 className="text-2xl font-extrabold text-mist-100 sm:text-3xl">
          The journey at a glance
        </h2>
        <div className="mt-6">
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
      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        subtext="Write one sentence about what you are after, and matching will come back with the resources that actually fit — scored, and with the reasons shown."
        to={user ? "/app/find" : "/register"}
        label={user ? "Find Capacity" : "Get Started"}
      />
    </div>
  );
}
