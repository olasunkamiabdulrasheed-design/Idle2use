/** About page — what Idle2Use is, the problem it solves, categories, trust.
 * The step-by-step walkthrough lives at /how-it-works, so this page links to
 * it rather than repeating it. */

import { ArrowRight, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { usePageTitle } from "../hooks/usePageTitle";
import { CATEGORIES, TRUST } from "../constants/site";

const PROBLEM = [
  {
    title: "Idle capacity quietly costs money",
    desc: "Halls, warehouses, vans and tools spend most of their life unused, while the people who own them keep paying rent, insurance and upkeep for every hour nothing happens.",
  },
  {
    title: "Finding capacity is slow and blind",
    desc: "Anyone who needs space or equipment ends up asking around in group chats and relying on word of mouth — with no way to compare what is available, or what it should cost.",
  },
  {
    title: "Strangers have no reason to trust each other",
    desc: "Booking someone's venue or vehicle normally depends on a personal connection. Without verifiable records, most people simply do not take the risk.",
  },
];

export default function About() {
  usePageTitle("About");

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-900 text-mist-200">
      <Navbar />

      <main className="container-page py-12 sm:py-16">
        {/* Intro */}
        <section className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand-300 uppercase">
            <Target className="h-3.5 w-3.5" /> About Idle2Use
          </span>
          <h1 className="mt-5 text-3xl leading-tight font-extrabold text-mist-100 sm:text-4xl lg:text-5xl">
            One marketplace for{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              unused capacity.
            </span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-mist-300 sm:text-base">
            Idle2Use connects people who need capacity — space, storage,
            transportation or equipment — with people who have it sitting
            unused. You describe what you need in your own words; the platform
            turns that into structured details, scores it against the resources
            that are actually free, and carries the whole thing through to a
            confirmed booking, with messaging and reviews alongside it.
          </p>
        </section>

        {/* Problem */}
        <section className="mt-14">
          <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
            The problem
          </p>
          <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
            What Idle2Use solves
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PROBLEM.map((p, i) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-ink-800 p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-sm font-extrabold text-brand-400">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-bold text-mist-100">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mist-400">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-14">
          <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
            Browse capacity
          </p>
          <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
            The four capacity categories
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* How it works — pointer to the dedicated page */}
        <section className="mt-14">
          <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-ink-800 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                Step by step
              </p>
              <h2 className="mt-2.5 text-xl font-extrabold text-mist-100 sm:text-2xl">
                Want the full walkthrough?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">
                The full guide walks both journeys end to end, explains exactly
                how resources are scored and ranked, and sets out the trust
                rules the API enforces — including what this MVP deliberately
                leaves out.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-500"
            >
              How it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Trust strip */}
        <section className="mt-8 grid grid-cols-1 gap-5 rounded-3xl border border-brand-500/20 bg-brand-500/[0.06] p-6 sm:grid-cols-3 sm:p-8">
          {TRUST.map(({ Icon, title, desc }) => (
            <div key={title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3.5 font-bold text-mist-100">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-mist-400">
                {desc}
              </p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-12 overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-600/20 via-ink-800 to-ink-800 p-8 text-center sm:p-12">
          <Sparkles className="mx-auto h-8 w-8 text-brand-400" />
          <h2 className="mt-4 text-2xl font-extrabold text-mist-100 sm:text-3xl">
            Ready to exchange capacity?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist-300">
            Create an account and describe what you are after in a sentence —
            or list the capacity you already have and let matching bring the
            requests to you.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-colors hover:bg-brand-500 sm:w-auto"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-mist-100 transition-colors hover:bg-white/[0.08] sm:w-auto"
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
