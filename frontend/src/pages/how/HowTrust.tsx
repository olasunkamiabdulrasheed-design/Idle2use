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
    desc: "JWT login with short-lived access tokens, refresh rotation, and a logout blacklist that invalidates refresh tokens server-side.",
  },
  {
    Icon: User,
    title: "Profiles",
    desc: "Every account carries a profile with contact details and read-only verification status flags (no verification flow ships in this MVP).",
  },
  {
    Icon: MessageSquare,
    title: "Messaging",
    desc: "Private conversations restricted to their participants — only they can read or send messages, enforced by the API.",
  },
  {
    Icon: CalendarDays,
    title: "Booking records",
    desc: "Every booking links requester and provider with a server-validated lifecycle: pending → confirmed → completed or cancelled.",
  },
  {
    Icon: Star,
    title: "Reviews",
    desc: "Only participants of a completed booking can leave a review — one review per booking, rating validated 1–5.",
  },
  {
    Icon: ShieldCheck,
    title: "Access control",
    desc: "Your requests, bookings and notifications are visible only to you; ownership is checked on every read and write.",
  },
  {
    Icon: CalendarX,
    title: "Conflict handling",
    desc: "Overlapping bookings on the same resource are rejected — double-booking is blocked at creation and on status updates.",
  },
];

const NOT_IN_MVP = [
  "No payments or escrow — bookings are records, money moves offline.",
  "No identity/phone verification flow — flags exist but are read-only.",
  "No email delivery — notifications live inside the app.",
];

export default function HowTrust() {
  usePageTitle("Trust & Reliability");

  return (
    <div className="pb-4">
      <HowHero
        title="Built for reliable collaboration"
        subtitle="Trust here comes from server-enforced rules, not promises. Everything below is checked by the API on every request."
      />

      {/* Mechanisms */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MECHANISMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/20 text-green-400">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-bold text-white">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* Honest limits */}
      <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6">
        <span className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          What is intentionally NOT in this MVP
        </span>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-300">
          {NOT_IN_MVP.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Related */}
      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        to="/register"
        label="Get Started"
      />
    </div>
  );
}
