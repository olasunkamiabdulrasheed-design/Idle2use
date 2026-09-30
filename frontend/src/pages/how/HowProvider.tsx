/** /how-it-works/provider — the provider journey + real categories. */

import { Bell, CalendarDays, Handshake, MessageSquare, Plus } from "lucide-react";
import { useAuth } from "../../authContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CATEGORIES } from "../../constants/site";
import { CtaBand, FlowRow, HowHero, NavCard, StepRow } from "./shared";

const STEPS = [
  {
    icon: Plus,
    title: "Create your resource",
    desc: "Give it a name, pick one of the four categories, set capacity and location.",
  },
  {
    icon: Plus,
    title: "Describe what is available",
    desc: "Add a description, capacity unit, and the type of resource — so requests of the right kind find it.",
  },
  {
    icon: CalendarDays,
    title: "Add availability",
    desc: "Define date + time windows when the resource is actually free.",
  },
  {
    icon: Bell,
    title: "Receive relevant requests",
    desc: "Matching runs automatically: your resource is scored against every active request of its category, and requesters are notified about new matches.",
  },
  {
    icon: Handshake,
    title: "Connect and collaborate",
    desc: "A requester books your resource — you get notified, confirm the booking, message directly, and get reviewed after completion.",
  },
];

export default function HowProvider() {
  const { user } = useAuth();
  usePageTitle("Offer Capacity");

  return (
    <div className="pb-4">
      <HowHero
        title="Have unused capacity? Put it to work."
        subtitle="If you own space, storage, vehicles or equipment that sits idle, listing it takes minutes — and matching keeps working for you in the background."
      />

      {/* Steps */}
      <ol className="mt-8 grid gap-3">
        {STEPS.map((s, i) => (
          <StepRow key={s.title} n={i + 1} title={s.title} desc={s.desc} />
        ))}
      </ol>

      {/* Categories */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          What you can list
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Four categories — each resource belongs to exactly one, which keeps
          matching precise.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ Icon, name, desc }) => (
            <div
              key={name}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/20 text-green-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-bold text-white">{name}</h3>
              <p className="mt-1 text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section className="mt-12">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          The provider loop at a glance
        </h2>
        <div className="mt-5">
          <FlowRow
            items={[
              "List resource",
              "Add availability",
              "Auto-matched",
              "Confirm booking",
              "Get reviewed",
            ]}
          />
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NavCard
          to="/how-it-works/request"
          Icon={MessageSquare}
          title="For People Who Need Capacity"
          desc="The other side of the marketplace — what requesters see."
        />
        <NavCard
          to="/how-it-works/matching"
          Icon={Bell}
          title="How Matching Works"
          desc="How your resource is scored against active requests."
        />
      </section>

      <CtaBand
        text="Have something to offer?"
        to={user ? "/app/resources" : "/register"}
        label={user ? "Offer Capacity" : "Get Started"}
      />
    </div>
  );
}
