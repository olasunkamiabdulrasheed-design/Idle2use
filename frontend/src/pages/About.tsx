/** About page — what Idle2Use is, the problem, how it works, categories. */

import { ArrowRight, Search, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { CATEGORIES, STEPS, TRUST } from "../constants/site";

const PROBLEM = [
  {
    title: "Idle capacity wastes money",
    desc: "Halls, warehouses, vans and tools sit unused for most of their life while their owners still pay for them.",
  },
  {
    title: "Finding capacity is slow",
    desc: "People who need space or equipment resort to group chats and word of mouth, with no way to compare options.",
  },
  {
    title: "No trust between strangers",
    desc: "Booking someone's venue or vehicle usually depends on personal connections rather than verifiable track records.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a1428] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
              <Search className="h-4 w-4" />
            </span>
            Idle<span className="text-green-500">2</span>Use
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-4"
            >
              Home
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-green-700 sm:px-4"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Intro */}
        <section className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-green-400 uppercase">
            <Target className="h-3.5 w-3.5" /> About Idle2Use
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold sm:text-4xl">
            One marketplace for{" "}
            <span className="text-green-500">unused capacity.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            Idle2Use connects people who need capacity — space, storage,
            transportation or equipment — with people who have unused capacity
            sitting idle. Requesters describe what they need in plain English;
            the platform parses it with AI, matches it against available
            resources using a weighted scoring engine, and takes the exchange
            all the way through booking, messaging and reviews.
          </p>
        </section>

        {/* Problem */}
        <section className="mt-12">
          <h2 className="text-xl font-extrabold sm:text-2xl">
            The problem it solves
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PROBLEM.map((p, i) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-extrabold">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works (shared with landing) */}
        <section className="mt-12">
          <h2 className="text-xl font-extrabold sm:text-2xl">
            How the platform works
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-extrabold">
                  {i + 1}
                </span>
                <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-green-400">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-2 font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-12">
          <h2 className="text-xl font-extrabold sm:text-2xl">
            The four capacity categories
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map(({ Icon, name, desc }) => (
              <div
                key={name}
                className="rounded-2xl bg-white p-5 text-slate-900 shadow-lg"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-bold">{name}</h3>
                <p className="mt-1 text-xs text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="mt-12 grid grid-cols-1 gap-4 rounded-3xl border border-green-500/20 bg-green-500/5 p-5 text-sm sm:grid-cols-3 sm:p-6">
          {TRUST.map(({ Icon, title, desc }) => (
            <div key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600/20 text-green-400">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-bold">{title}</p>
              <p className="mt-1 text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl bg-green-600 p-6 text-center sm:p-10">
          <Sparkles className="mx-auto h-8 w-8" />
          <h2 className="mt-3 text-2xl font-extrabold">
            Ready to exchange capacity?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-green-50">
            Create an account and post your first request — or list the
            capacity you already have.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 sm:w-auto"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
