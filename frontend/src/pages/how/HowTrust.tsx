/** /how-it-works/trust — documents ONLY mechanisms that exist in this
 * project (verified against backend code). Nothing invented. */

import {
  AlertTriangle,
  CalendarDays,
  CalendarX,
  KeyRound,
  MessageSquare,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CtaBand, HowHero, NavCard } from "./shared";

const MECHANISMS: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: KeyRound,
    title: "Authentication",
    desc: "JWT login with short-lived access tokens and refresh rotation. Logging out blacklists the refresh token server-side, so a stolen session cannot simply be replayed.",
  },
  {
    Icon: User,
    title: "Profiles",
    desc: "Every account carries a profile with contact details and read-only verification status flags. Being honest about it: the flags exist, but no verification flow ships in this MVP.",
  },
  {
    Icon: MessageSquare,
    title: "Private messaging",
    desc: "Conversations belong to their participants and nobody else. Only the two people in a thread can read it or send to it, and the API enforces that on every request.",
  },
  {
    Icon: CalendarDays,
    title: "Booking records",
    desc: "Every booking links the requester to the provider and moves through a server-validated lifecycle: pending, confirmed, then completed or cancelled. No state can be skipped.",
  },
  {
    Icon: Star,
    title: "Reviews",
    desc: "Only the two participants of a completed booking can leave a review, one each per booking, with the rating validated between 1 and 5. You cannot review a deal that never happened.",
  },
  {
    Icon: ShieldCheck,
    title: "Access control",
    desc: "Your requests, bookings and notifications are visible to you and no one else. Ownership is checked on every read and every write, not filtered out afterwards in the UI.",
  },
  {
    Icon: CalendarX,
    title: "Conflict handling",
    desc: "Two bookings cannot claim the same resource for overlapping times. Clashes are rejected at creation and again on any status update, so double-booking never takes hold.",
  },
];

const NOT_IN_MVP = [
  "No payments or escrow — bookings are records of an agreement, and money changes hands offline.",
  "No identity or phone verification flow — the flags on a profile exist but are read-only for now.",
  "No email delivery — every notification lives inside the app, so check there rather than your inbox.",
];

export default function HowTrust() {
  usePageTitle("Trust & Reliability");

  return (
    <div>
      <HowHero
        title="Built for reliable collaboration"
        subtitle="Trust here comes from server-enforced rules, not promises. Everything below is checked by the API on every request."
      />

      {/* Mechanisms */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MECHANISMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-white/10 bg-ink-800 p-5 transition-colors hover:border-white/20"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-bold text-mist-100">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Honest limits */}
      <section className="mt-12 rounded-2xl border border-warn-400/25 bg-warn-400/[0.07] p-6">
        <span className="flex items-center gap-2.5 font-bold text-warn-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          What is intentionally NOT in this MVP
        </span>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-mist-300">
          {NOT_IN_MVP.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Related */}
      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NavCard
          to="/how-it-works/matching"
          Icon={ShieldCheck}
          title="How Matching Works"
          desc="Deterministic gates and scoring — no hidden heuristics."
        />
        <NavCard
          to="/how-it-works"
          Icon={Star}
          title="How Idle2Use works"
          desc="Back to the overview of the whole flow."
        />
      </section>

      <CtaBand
        text="Join a platform with rules you can inspect"
        subtext="No black-box promises. Every guarantee on this page is enforced by the API, and the things this MVP deliberately leaves out are listed just as plainly."
        to="/register"
        label="Get Started"
      />
    </div>
  );
}
