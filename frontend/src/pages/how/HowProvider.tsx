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
    desc: "Give it a name, choose the one category it belongs to, and set how much it holds and where it is. This is the foundation everything else builds on.",
  },
  {
    icon: Plus,
    title: "Describe what is available",
    desc: "Add a description, the unit your capacity is measured in, and the type of resource it is — so requests of the right kind actually find it.",
  },
  {
    icon: CalendarDays,
    title: "Add availability",
    desc: "Define the date and time windows when the resource is genuinely free. Matching only ever offers it inside these windows, so nothing gets promised twice.",
  },
  {
    icon: Bell,
    title: "Receive relevant requests",
    desc: "Matching runs on its own: your resource is scored against every active request in its category, and requesters are notified the moment a new match appears.",
  },
  {
    icon: Handshake,
    title: "Connect and collaborate",
    desc: "A requester books your resource — you get notified, confirm the booking, message them directly, and receive a review once it is completed.",
  },
];

export default function HowProvider() {
  const { user } = useAuth();
  usePageTitle("Offer Capacity");

  return (
    <div>
      <HowHero
        title="Have unused capacity? Put it to work."
        subtitle="If you own space, storage, vehicles or equipment that sits idle, listing it takes minutes — and matching keeps working for you in the background."
      />

      {/* Steps */}
      <ol className="mt-10 grid gap-3">
        {STEPS.map((s, i) => (
          <StepRow key={s.title} n={i + 1} title={s.title} desc={s.desc} />
        ))}
      </ol>

      {/* Categories */}
      <section className="mt-16">
        <h2 className="text-2xl font-extrabold text-mist-100 sm:text-3xl">
          What you can list
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist-400">
          Four categories, and each resource belongs to exactly one of them.
          That single choice is what keeps matching precise — your listing is
          only ever compared against requests that are actually after what you
          have.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ Icon, name, desc }) => (
            <div
              key={name}
              className="rounded-2xl border border-white/10 bg-ink-800 p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-mist-100">{name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-mist-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section className="mt-16">
        <h2 className="text-2xl font-extrabold text-mist-100 sm:text-3xl">
          The provider loop at a glance
        </h2>
        <div className="mt-6">
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
      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        subtext="List it once and matching keeps working for you — scoring your resource against every new request that fits, so you hear about the good ones without lifting a finger."
        to={user ? "/app/resources" : "/register"}
        label={user ? "Offer Capacity" : "Get Started"}
      />
    </div>
  );
}
