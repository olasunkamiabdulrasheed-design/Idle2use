/** Public landing page — hero, categories, trust, footer.
 * The full "How it works" walkthrough lives on its own page at /how-it-works;
 * this page only links to it.
 * Responsive from 320px up: hamburger nav, stacked CTAs, single-column
 * mobile layouts, no horizontal overflow. */

import { useEffect } from "react";
import {
  ArrowRight,
  Boxes,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { CATEGORIES, TRUST } from "../constants/site";

const STATS: [string, string][] = [
  ["4", "Categories"],
  ["AI", "Request parsing"],
  ["5-factor", "Match scoring"],
];

export default function Landing() {
  const { user } = useAuth();
  const { hash } = useLocation();
  const appLink = user ? "/app" : "/register";

  usePageTitle();

  // Smooth-scroll to section when arriving with a hash (e.g. from the footer).
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    // Wait one frame so the section exists after route render.
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-900 text-mist-200">
      <Navbar />

      {/* Hero */}
      <section id="top" className="relative isolate overflow-hidden">
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/12 blur-[120px]" />
          <div className="absolute top-20 -right-32 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" />
        </div>

        <div className="container-wide grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand-300 uppercase">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> Capacity marketplace
            </span>

            <h1 className="mt-6 text-[2rem] leading-[1.05] font-extrabold break-words text-mist-100 sm:text-5xl lg:text-6xl">
              Turn unused capacity into{" "}
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                opportunity.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-mist-300">
              Somewhere nearby there is a hall standing empty, a van parked up
              for the week, a warehouse with floor space going spare. Idle2Use
              is where the people who own that capacity meet the people who
              need it — matched by fit, not by who you happen to know.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={appLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-colors hover:bg-brand-500 sm:w-auto"
              >
                <Search className="h-4 w-4 shrink-0" /> I need capacity
              </Link>
              <Link
                to={appLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-mist-100 transition-colors hover:border-white/30 hover:bg-white/[0.08] sm:w-auto"
              >
                <Boxes className="h-4 w-4 shrink-0" /> I have capacity
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-7">
              {STATS.map(([v, l]) => (
                <div key={l} className="min-w-0">
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-xl font-extrabold break-words text-mist-100 sm:text-2xl">
                    {v}
                  </dd>
                  <dd className="mt-0.5 text-[11px] text-mist-400 sm:text-xs">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Auth teaser card */}
          <div className="relative w-full min-w-0">
            <div
              aria-hidden="true"
              className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/20 via-transparent to-sky-500/10 blur-2xl"
            />
            <div className="rounded-3xl border border-white/10 bg-ink-800/80 p-6 backdrop-blur-xl sm:p-8">
              <h2 className="text-lg font-extrabold text-mist-100">
                Ready to exchange capacity?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">
                It takes a couple of minutes to set up. From there you get a
                dashboard with your matches, bookings and messages, and an
                inbox that tells you when something new lines up.
              </p>

              <div className="mt-5 space-y-2.5">
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-500"
                >
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-mist-100 transition-colors hover:bg-white/[0.06]"
                >
                  I already have an account
                </Link>
              </div>

              <ul className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs text-mist-400">
                {[
                  "Describe what you need in a sentence — no forms to fill in",
                  "Scored matches against capacity that is genuinely free",
                  "Bookings, messaging and reviews all in one place",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="container-wide scroll-mt-20 border-t border-white/10 py-16 sm:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              Browse capacity
            </p>
            <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
              Four kinds of capacity, one marketplace
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist-400">
              Every listing belongs to exactly one category, and each one comes
              with its own details — capacity, location, availability — so you
              can judge a match before you ever get in touch.
            </p>
          </div>
          <Link
            to={appLink}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-400 transition-colors hover:text-brand-300"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {CATEGORIES.map(({ Icon, name, desc }) => (
            <Link
              key={name}
              to={appLink}
              aria-label={`Get started with ${name}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-5 transition-colors hover:border-brand-500/40 focus-visible:outline-none"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-4 font-bold text-mist-100">{name}</h3>
              <p className="relative mt-1.5 text-xs leading-relaxed text-mist-400">
                {desc}
              </p>
              <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400">
                Get started
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section
        id="trust"
        className="container-wide scroll-mt-20 border-t border-white/10 py-16 sm:py-20"
      >
        <div className="rounded-3xl border border-brand-500/20 bg-brand-500/[0.06] p-6 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
              Trust & safety
            </p>
            <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
              Built on trust & reliability
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist-400 sm:text-base">
              None of this rests on good intentions. Access, ownership,
              booking clashes and reviews are checked by the API on every
              request — so the rules hold whichever screen you are looking at.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TRUST.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-ink-900/60 p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3.5 font-bold text-mist-100">{title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-mist-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/how-it-works"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-mist-100 transition-colors hover:border-brand-500/50 hover:text-brand-300"
          >
            See how Idle2Use works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
