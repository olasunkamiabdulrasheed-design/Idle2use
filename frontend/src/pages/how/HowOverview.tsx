/** /how-it-works — a clear, responsive introduction to the marketplace. */

import {
  ArrowRight,
  Building2,
  Boxes,
  CalendarCheck,
  MessageSquare,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";
import { CATEGORIES } from "../../constants/site";
import { usePageTitle } from "../../hooks/usePageTitle";
import { CtaBand } from "./shared";

const JOURNEY = [
  {
    Icon: PenLine,
    title: "Describe",
    desc: "Say what you need, or add details about what you can offer.",
  },
  {
    Icon: Sparkles,
    title: "Find a match",
    desc: "Relevant requests and available resources are matched.",
  },
  {
    Icon: MessageSquare,
    title: "Connect",
    desc: "Compare the details and message the other person.",
  },
  {
    Icon: CalendarCheck,
    title: "Arrange a booking",
    desc: "Agree on the details and manage the booking in one place.",
  },
];

const GUIDES = [
  {
    to: "/how-it-works/request",
    Icon: Search,
    label: "I need capacity",
    title: "Find a space or resource",
    desc: "Describe what you are looking for, review suitable matches, and connect with a provider.",
  },
  {
    to: "/how-it-works/provider",
    Icon: Boxes,
    label: "I have capacity",
    title: "Make a resource available",
    desc: "List what you have, add availability, and hear from people looking for it.",
  },
];

const MORE_GUIDES = [
  {
    to: "/how-it-works/matching",
    Icon: Sparkles,
    title: "How matching works",
    desc: "Eligibility checks and match scores",
  },
  {
    to: "/how-it-works/trust",
    Icon: ShieldCheck,
    title: "Trust & reliability",
    desc: "Bookings, reviews, and account access",
  },
];

export default function HowOverview() {
  const { user } = useAuth();
  usePageTitle("How It Works");

  return (
    <div className="pb-12">
      <div className="mx-auto w-full max-w-screen-2xl">
        <section className="relative isolate grid overflow-hidden border-b border-white/10 bg-[#0b192e] -mx-4 sm:-mx-8 lg:-mx-12 2xl:-mx-16 lg:min-h-[560px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20 xl:px-20 2xl:px-24">
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-green-400 uppercase">
              <Sparkles className="h-4 w-4" />
              How Idle2Use works
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Put idle capacity to work.{" "}
              <span className="text-green-400">Find what you need.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Find space, storage, transportation, or equipment — or help
              someone else put theirs to use. Idle2Use brings both sides
              together to connect and arrange a booking.
            </p>
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
              <Link
                to={user ? "/app/find" : "/register"}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#steps"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-white/40 hover:text-white focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
              >
                See how it works
              </a>
            </div>
          </div>

          <div
            aria-label="Illustration of a space and transport resource connected through Idle2Use"
            className="relative isolate flex min-h-[280px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,rgba(34,197,94,0.24),transparent_52%),linear-gradient(135deg,#102d39,#0c2230_55%,#111b30)] sm:min-h-[360px] lg:min-h-full"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
            />
            <div
              aria-hidden="true"
              className="absolute h-[min(74vw,390px)] w-[min(74vw,390px)] rounded-full border border-green-300/15 sm:h-[390px] sm:w-[390px]"
            />
            <div
              aria-hidden="true"
              className="absolute h-[min(52vw,275px)] w-[min(52vw,275px)] rounded-full border border-green-300/20 sm:h-[275px] sm:w-[275px]"
            />

            <div className="relative z-10 flex w-full max-w-2xl items-center justify-center gap-3 px-4 sm:gap-8 sm:px-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-[#0a1428]/75 text-green-300 shadow-[0_0_55px_rgba(34,197,94,0.14)] sm:h-28 sm:w-28">
                  <Building2 className="h-9 w-9 sm:h-12 sm:w-12" strokeWidth={1.35} />
                </span>
                <span className="text-[10px] font-bold tracking-[0.18em] text-slate-300 uppercase sm:text-xs">
                  Space
                </span>
              </div>

              <div className="mb-6 flex min-w-16 flex-1 flex-col items-center gap-2 sm:min-w-24">
                <span className="text-[9px] font-bold tracking-[0.18em] text-green-300 uppercase sm:text-[10px]">
                  Find a match
                </span>
                <span className="flex w-full items-center">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/60 to-green-300/80" />
                  <ArrowRight className="h-4 w-4 shrink-0 text-green-300 sm:h-5 sm:w-5" />
                  <span className="h-px flex-1 bg-gradient-to-r from-green-300/80 via-green-300/60 to-transparent" />
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-[#0a1428]/75 text-green-300 shadow-[0_0_55px_rgba(34,197,94,0.14)] sm:h-28 sm:w-28">
                  <Truck className="h-9 w-9 sm:h-12 sm:w-12" strokeWidth={1.35} />
                </span>
                <span className="text-[10px] font-bold tracking-[0.18em] text-slate-300 uppercase sm:text-xs">
                  Transport
                </span>
              </div>
            </div>

            <p className="absolute right-4 bottom-4 left-4 text-center text-xs tracking-wide text-slate-400 sm:bottom-7">
              Space · Storage · Transport · Equipment
            </p>
          </div>
        </section>

        <section id="steps" className="scroll-mt-6 border-b border-white/10 py-12 sm:py-16">
          <div className="grid gap-3 sm:grid-cols-2 sm:items-end sm:gap-8">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-green-400 uppercase">
                A simple process
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                From first search to booking
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:justify-self-end sm:text-base">
              Whether you are looking for a resource or making one available,
              the same straightforward steps bring both sides together.
            </p>
          </div>

          <ol className="mt-8 grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
            {JOURNEY.map(({ Icon, title, desc }, index) => (
              <li
                key={title}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-t border-white/10 py-5 sm:px-5 sm:first:pl-0 sm:nth-[2]:border-t sm:nth-[3]:pl-0 xl:border-t-0 xl:border-l xl:px-5 xl:first:border-l-0 xl:first:pl-0"
              >
                <span className="row-span-2 flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-300">
                  0{index + 1}
                </span>
                <span className="flex items-center gap-2 font-bold text-white">
                  <Icon className="h-4 w-4 text-green-400" />
                  {title}
                </span>
                <p className="col-start-2 mt-1 text-sm leading-relaxed text-slate-400">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            AI may help structure a plain-English request. Matches are scored
            using details from the request and resource.
          </p>
        </section>

        <section className="border-b border-white/10 py-12 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.16em] text-green-400 uppercase">
              Choose your starting point
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              What would you like to do?
            </h2>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {GUIDES.map(({ to, Icon, label, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="group flex min-w-0 items-start gap-4 border-t border-white/10 py-5 transition-colors hover:border-green-500/50 focus-visible:outline-none"
              >
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-green-400 transition-colors group-hover:bg-green-500/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold tracking-widest text-green-400 uppercase">
                    {label}
                  </span>
                  <span className="mt-1 block text-lg font-bold text-white sm:text-xl">
                    {title}
                  </span>
                  <span className="mt-2 block max-w-xl text-sm leading-relaxed text-slate-400">
                    {desc}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-200 group-hover:text-green-300">
                    Explore this path
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="categories" className="scroll-mt-6 border-b border-white/10 py-12 sm:py-16">
          <div className="grid gap-3 sm:grid-cols-2 sm:items-end sm:gap-8">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-green-400 uppercase">
                Browse capacity
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                Four kinds of resources
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:justify-self-end sm:text-base">
              Explore the spaces and resources people can request or make
              available on Idle2Use.
            </p>
          </div>

          <ul className="mt-7 grid gap-x-10 sm:grid-cols-2">
            {CATEGORIES.map(({ Icon, name, desc }) => (
              <li
                key={name}
                className="flex items-start gap-4 border-t border-white/10 py-5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center text-green-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-white">{name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-5 py-12 sm:grid-cols-2 sm:gap-8 sm:py-16">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-green-400 uppercase">
              Want more detail?
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              Explore the guides
            </h2>
          </div>
          <ul className="divide-y divide-white/10 border-t border-white/10">
            {MORE_GUIDES.map(({ to, Icon, title, desc }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex min-h-16 items-center gap-3 py-4 focus-visible:outline-none"
                >
                  <Icon className="h-4 w-4 shrink-0 text-green-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white group-hover:text-green-300">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-400">
                      {desc}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-green-400" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <CtaBand
          text="Ready to put capacity to use?"
          to={user ? "/app" : "/register"}
          label={user ? "Go to Dashboard" : "Get Started"}
        />
      </div>
    </div>
  );
}
