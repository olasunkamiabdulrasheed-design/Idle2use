/** /how-it-works — a clear, responsive introduction to the marketplace. */

import {
  ArrowRight,
  Boxes,
  Building2,
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
    desc: "Write what you need in a sentence, or list the capacity you have to offer. No long forms, no jargon — plain language is enough to start.",
  },
  {
    Icon: Sparkles,
    title: "Find a match",
    desc: "Your request is checked against every available resource, and only the ones that genuinely fit come back — each with a score and the reasons behind it.",
  },
  {
    Icon: MessageSquare,
    title: "Connect",
    desc: "Read the details side by side, then message the other person directly to ask questions, agree terms, and settle anything the listing does not cover.",
  },
  {
    Icon: CalendarCheck,
    title: "Arrange a booking",
    desc: "Create the booking, both sides confirm it, and everything — status, messages and history — stays in one place you can come back to.",
  },
];

const GUIDES = [
  {
    to: "/how-it-works/request",
    Icon: Search,
    label: "I need capacity",
    title: "Find a space or resource",
    desc: "Describe what you are looking for, review the matches that actually fit your date, location and size, and connect with a provider who has it free.",
  },
  {
    to: "/how-it-works/provider",
    Icon: Boxes,
    label: "I have capacity",
    title: "Make a resource available",
    desc: "List what you have, set the hours it is genuinely free, and let matching bring the right requests to you instead of chasing them yourself.",
  },
];

const MORE_GUIDES = [
  {
    to: "/how-it-works/matching",
    Icon: Sparkles,
    title: "How matching works",
    desc: "The eligibility gates every resource must clear, and the five weighted factors that decide the final score",
  },
  {
    to: "/how-it-works/trust",
    Icon: ShieldCheck,
    title: "Trust & reliability",
    desc: "How bookings, reviews and account access are enforced — including what is deliberately left out of this MVP",
  },
];

export default function HowOverview() {
  const { user } = useAuth();
  usePageTitle("How It Works");

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-500/12 blur-[110px]" />
          <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-[100px]" />
        </div>

        <div className="grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              <Sparkles className="h-4 w-4" />
              How Idle2Use works
            </p>
            <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold tracking-tight text-mist-100 sm:text-5xl lg:text-6xl">
              Put idle capacity to work.{" "}
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                Find what you need.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-mist-300 sm:text-lg">
              Space, storage, transportation and equipment all sit unused
              somewhere nearby. Idle2Use is where the people who have that spare
              capacity meet the people who need it — matching them up, and
              giving both sides one place to agree the details.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link
                to={user ? "/app/find" : "/register"}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-colors hover:bg-brand-500"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#steps"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-mist-200 transition-colors hover:border-white/30 hover:text-mist-100"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Illustration */}
          <div
            aria-label="Illustration of a space and transport resource connected through Idle2Use"
            className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_45%,rgba(34,197,94,0.22),transparent_55%),linear-gradient(135deg,#102d39,#0c2230_55%,#111b30)] sm:min-h-[340px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
            />
            <div
              aria-hidden="true"
              className="absolute h-[min(64vw,320px)] w-[min(64vw,320px)] rounded-full border border-brand-300/15"
            />
            <div
              aria-hidden="true"
              className="absolute h-[min(44vw,220px)] w-[min(44vw,220px)] rounded-full border border-brand-300/20"
            />

            <div className="relative z-10 flex w-full items-center justify-center gap-4 px-6 sm:gap-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-ink-900/75 text-brand-300 shadow-[0_0_55px_rgba(34,197,94,0.14)] sm:h-24 sm:w-24">
                  <Building2 className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.35} />
                </span>
                <span className="text-[10px] font-bold tracking-[0.18em] text-mist-400 uppercase sm:text-xs">
                  Space
                </span>
              </div>

              <div className="mb-6 flex min-w-16 flex-1 flex-col items-center gap-2 sm:min-w-24">
                <span className="text-[9px] font-bold tracking-[0.18em] text-brand-300 uppercase sm:text-[10px]">
                  Find a match
                </span>
                <span className="flex w-full items-center">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-300/60 to-brand-300/80" />
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-300 sm:h-5 sm:w-5" />
                  <span className="h-px flex-1 bg-gradient-to-r from-brand-300/80 via-brand-300/60 to-transparent" />
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-ink-900/75 text-brand-300 shadow-[0_0_55px_rgba(34,197,94,0.14)] sm:h-24 sm:w-24">
                  <Truck className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.35} />
                </span>
                <span className="text-[10px] font-bold tracking-[0.18em] text-mist-400 uppercase sm:text-xs">
                  Transport
                </span>
              </div>
            </div>

            <p className="absolute right-4 bottom-5 left-4 text-center text-xs tracking-wide text-mist-500">
              Space · Storage · Transport · Equipment
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="scroll-mt-24 border-t border-white/10 py-14 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end sm:gap-10">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              A simple process
            </p>
            <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
              From first search to booking
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-mist-400 sm:justify-self-end sm:text-base">
            Whether you are searching for somewhere to work, somewhere to store
            things, or a way to move them — or you are the one with capacity
            sitting idle — the same four steps bring both sides together.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {JOURNEY.map(({ Icon, title, desc }, index) => (
            <li
              key={title}
              className="relative rounded-2xl border border-white/10 bg-ink-800 p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-sm font-extrabold text-brand-400">
                0{index + 1}
              </span>
              <span className="mt-4 flex items-center gap-2 font-bold text-mist-100">
                <Icon className="h-4 w-4 text-brand-400" />
                {title}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">
                {desc}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-xs leading-relaxed text-mist-500">
          AI may be used to turn a plain-English sentence into structured
          details. Matching itself is not guesswork — every match is scored from
          the details in the request and the resource.
        </p>
      </section>

      {/* Choose your path */}
      <section className="border-t border-white/10 py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
            Choose your starting point
          </p>
          <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
            What would you like to do?
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {GUIDES.map(({ to, Icon, label, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-ink-800 p-6 transition-colors hover:border-brand-500/40 focus-visible:outline-none"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                {label}
              </span>
              <span className="mt-1.5 text-lg font-bold text-mist-100 sm:text-xl">
                {title}
              </span>
              <span className="mt-2.5 flex-1 text-sm leading-relaxed text-mist-400">
                {desc}
              </span>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-400">
                Explore this path
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="scroll-mt-24 border-t border-white/10 py-14 sm:py-20"
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end sm:gap-10">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              Browse capacity
            </p>
            <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
              Four kinds of resources
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-mist-400 sm:justify-self-end sm:text-base">
            Every listing on Idle2Use belongs to exactly one of four categories.
            Pick the one that fits and you will see what people are actually
            offering near you, and how they describe it.
          </p>
        </div>

        <ul className="mt-9 grid gap-x-10 sm:grid-cols-2">
          {CATEGORIES.map(({ Icon, name, desc }) => (
            <li
              key={name}
              className="flex items-start gap-4 border-t border-white/10 py-5"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-mist-100">{name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mist-400">
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* More guides */}
      <section className="grid gap-6 border-t border-white/10 py-14 sm:grid-cols-2 sm:gap-10 sm:py-20">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
            Want more detail?
          </p>
          <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
            Explore the guides
          </h2>
        </div>
        <ul className="divide-y divide-white/10 border-t border-white/10">
          {MORE_GUIDES.map(({ to, Icon, title, desc }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex min-h-16 items-center gap-3.5 py-4 focus-visible:outline-none"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-mist-100 transition-colors group-hover:text-brand-300">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-sm text-mist-400">
                    {desc}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-mist-500 transition-all group-hover:translate-x-1 group-hover:text-brand-400" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand
        text="Ready to put capacity to use?"
        subtext="Create an account to describe what you need, or to list what you have spare. It takes a couple of minutes, and matching does the rest."
        to={user ? "/app" : "/register"}
        label={user ? "Go to Dashboard" : "Get Started"}
      />
    </div>
  );
}
