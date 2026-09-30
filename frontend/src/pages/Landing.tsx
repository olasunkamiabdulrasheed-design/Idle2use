/** Public landing page — hero, categories, how it works, trust, footer.
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

export default function Landing() {
  const { user } = useAuth();
  const { hash } = useLocation();
  const appLink = user ? "/app" : "/register";

  usePageTitle();

  // Smooth-scroll to section when arriving with a hash (e.g. from /about).
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
    <div className="min-h-screen overflow-x-hidden bg-[#0a1428] text-white">
      <Navbar />

      {/* Hero */}
      <section
        id="top"
        className="mx-auto max-w-6xl px-4 pt-10 pb-10 sm:px-6 sm:pt-14"
      >
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-green-400 uppercase sm:px-4 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> Capacity
              Marketplace
            </span>
            <h1 className="mt-5 text-[1.75rem] leading-tight font-extrabold break-words sm:text-4xl lg:text-5xl">
              Turn unused capacity into{" "}
              <span className="text-green-500">opportunity.</span>
            </h1>
            <p className="mt-4 text-sm text-slate-300 sm:text-base">
              Idle2Use connects people who need capacity with people who have
              unused space, resources and equipment. Maximize what you have.
              Get what you need.
            </p>

            {/* CTA buttons: stacked on small screens */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-start">
              <Link
                to={appLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none sm:w-auto sm:px-6"
              >
                <Search className="h-4 w-4 shrink-0" /> I NEED CAPACITY
              </Link>
              <Link
                to={appLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none sm:w-auto sm:px-6"
              >
                <Boxes className="h-4 w-4 shrink-0" /> I HAVE CAPACITY
              </Link>
            </div>

            {/* Inline stats */}
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-2 border-t border-white/10 pt-6 sm:gap-4">
              {[
                ["4", "Categories"],
                ["AI", "Request parsing"],
                ["5-factor", "Match scoring"],
              ].map(([v, l]) => (
                <div key={l} className="min-w-0">
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-lg font-extrabold break-words text-white sm:text-xl">
                    {v}
                  </dd>
                  <dd className="text-[10px] text-slate-400 sm:text-xs">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Auth teaser card — moves below hero content on mobile */}
          <div className="w-full min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-7">
            <h2 className="text-lg font-extrabold text-white">
              Ready to exchange capacity?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Create an account in seconds, or sign in to reach your dashboard,
              matches, bookings and messages.
            </p>
            <div className="mt-5 space-y-3">
              <Link
                to="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-xl border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
            <ul className="mt-5 space-y-2 text-xs text-slate-400">
              {[
                "JWT authentication with refresh + logout blacklist",
                "Persistent requests, matching and booking history",
                "In-app notifications and provider messaging",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Categories: 1 col mobile / 2 col sm / 4 col lg, clickable */}
      <section id="categories" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          Browse by category
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Four kinds of capacity, one marketplace.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ Icon, name, desc }) => (
            <Link
              key={name}
              to="/register"
              aria-label={`Get started with ${name}`}
              className="group rounded-2xl bg-white p-5 text-slate-900 shadow-lg transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-green-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-bold">{name}</h3>
              <p className="mt-1 text-xs text-slate-500">{desc}</p>
              <ArrowRight className="mt-3 h-4 w-4 text-green-700 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* How it works preview — full section lives at /how-it-works */}
      <section id="how" className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <h2 className="text-xl font-extrabold text-white sm:text-3xl">
              How Idle2Use works
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
              Describe what you need — or what you have. Idle2Use matches both
              sides, then you connect and book through the platform.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["01", "Describe", "Plain English in, structured request out."],
              ["02", "Match", "Scored against active capacity automatically."],
              ["03", "Connect", "Message, book and review — in the app."],
            ].map(([n, title, desc]) => (
              <div
                key={n}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="text-2xl font-extrabold text-green-500/70">
                  {n}
                </span>
                <h3 className="mt-2 font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>

          <Link
            to="/how-it-works"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-green-500 hover:text-green-400 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
          >
            Explore how it works
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trust: 1 col mobile, 3 col md+ */}
      <section id="trust" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-5 sm:p-8">
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">
            Built on trust & reliability
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            {TRUST.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white/5 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600/20 text-green-400">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-bold text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
