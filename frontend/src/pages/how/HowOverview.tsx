/** /how-it-works — overview: two paths, overall flow, navigation cards. */

import { Boxes, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CtaBand, FlowRow, HowHero, NavCard } from "./shared";

const PATHS = [
  {
    to: "/how-it-works/request",
    Icon: Search,
    title: "I NEED CAPACITY",
    desc: "Find space, storage, transportation, or equipment.",
  },
  {
    to: "/how-it-works/provider",
    Icon: Boxes,
    title: "I HAVE CAPACITY",
    desc: "List unused resources and make them available.",
  },
];

const TOPICS = [
  {
    to: "/how-it-works/request",
    Icon: Search,
    title: "For People Who Need Capacity",
    desc: "Post a request in plain English and review scored matches.",
  },
  {
    to: "/how-it-works/provider",
    Icon: Boxes,
    title: "For Capacity Providers",
    desc: "Create a resource, add availability, and get found.",
  },
  {
    to: "/how-it-works/matching",
    Icon: Sparkles,
    title: "How Matching Works",
    desc: "The hard gates and five weighted factors behind every score.",
  },
  {
    to: "/how-it-works/trust",
    Icon: ShieldCheck,
    title: "Trust & Reliability",
    desc: "The access, booking, review and conflict rules the API enforces.",
  },
];

export default function HowOverview() {
  const { user } = useAuth();
  usePageTitle("How It Works");

  return (
    <div className="pb-8">
      <HowHero
        title="How Idle2Use works"
        subtitle="Connect unused capacity with people who need it."
      />
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400">
        Idle2Use is a capacity marketplace. One side describes what they need,
        the other lists what they have unused — space, storage, transportation
        or equipment. Requests and resources are matched automatically by the
        API, then both sides message and book through the platform.
      </p>

      {/* Two primary paths */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {PATHS.map(({ to, Icon, title, desc }) => (
          <Link
            key={title}
            to={to}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none sm:p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-extrabold tracking-wide text-white sm:text-lg">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-green-400">
              Learn more
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Overall flow */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          The overall flow
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Four steps from describing a need to a completed exchange.
        </p>
        <div className="mt-5">
          <FlowRow items={["Describe", "Match", "Connect", "Book"]} />
        </div>
      </section>

      {/* Topic navigation */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          Explore in detail
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <NavCard key={t.to} {...t} />
          ))}
        </div>
      </section>

      <CtaBand
        text="Ready to exchange capacity?"
        to={user ? "/app" : "/register"}
        label={user ? "Go to Dashboard" : "Get Started"}
      />
    </div>
  );
}
