/** Public landing page — hero, categories, how it works, trust, footer. */

import {
  ArrowRight,
  Boxes,
  Building2,
  Handshake,
  Lock,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useAuth } from "../authContext";

const CATEGORIES = [
  { Icon: Building2, name: "Spaces & Venues", desc: "Halls, classrooms, meeting rooms, event spaces" },
  { Icon: Boxes, name: "Storage", desc: "Warehouses, containers, secure storage" },
  { Icon: Truck, name: "Transportation", desc: "Vehicles, trucks, delivery capacity" },
  { Icon: Wrench, name: "Equipment", desc: "Tools, machinery, specialized equipment" },
];

const STEPS = [
  { Icon: PenLine, title: "Describe what you need", desc: "Type it in plain English — our AI structures your request." },
  { Icon: Sparkles, title: "Get matched instantly", desc: "The matching engine scores available capacity against your needs." },
  { Icon: Handshake, title: "Book & collaborate", desc: "Confirm bookings, message providers, and leave reviews." },
];

const TRUST = [
  { Icon: ShieldCheck, title: "Verified profiles", desc: "Phone and identity verification flags on every account." },
  { Icon: Star, title: "Real reviews", desc: "Ratings only after completed bookings — no fake trust." },
  { Icon: Lock, title: "Backend-owned rules", desc: "Access, ownership and conflicts enforced by the API." },
];

export default function Landing() {
  const { user } = useAuth();
  const appLink = user ? "/app" : "/register";

  return (
    <div className="min-h-screen bg-[#0a1428] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
              <Zap className="h-4 w-4 text-white" fill="currentColor" />
            </span>
            Idle<span className="text-green-500">2</span>Use
          </Link>
          <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
            <a href="#how" className="hover:text-white">How It Works</a>
            <a href="#categories" className="hover:text-white">Categories</a>
            <a href="#trust" className="hover:text-white">About</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-4"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-green-700 sm:px-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1 text-xs font-bold tracking-widest text-green-400 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Capacity Marketplace
            </span>
            <h1 className="mt-5 text-3xl leading-tight font-extrabold sm:text-5xl">
              Turn unused capacity into{" "}
              <span className="text-green-500">opportunity.</span>
            </h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Idle2Use connects people who need capacity with people who have
              unused space, resources and equipment. Maximize what you have.
              Get what you need.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={appLink}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-700"
              >
                <Search className="h-4 w-4" /> I NEED CAPACITY
              </Link>
              <Link
                to={appLink}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                <Boxes className="h-4 w-4" /> I HAVE CAPACITY
              </Link>
            </div>

            {/* Inline stats */}
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                ["4", "Categories"],
                ["AI", "Request parsing"],
                ["5-weight", "Match scoring"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-xl font-extrabold text-white">{v}</p>
                  <p className="text-xs text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Auth teaser card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
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

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="text-2xl font-extrabold text-white">
          Browse by category
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Four kinds of capacity, one marketplace.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ Icon, name, desc }) => (
            <div
              key={name}
              className="group rounded-2xl bg-white p-5 text-slate-900 shadow-lg transition-transform hover:-translate-y-1"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-green-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-bold">{name}</h3>
              <p className="mt-1 text-xs text-slate-500">{desc}</p>
              <ArrowRight className="mt-3 h-4 w-4 text-green-700" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold text-white sm:text-3xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="mt-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-green-400">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold text-white">
            Built on trust & reliability
          </h2>
          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
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
