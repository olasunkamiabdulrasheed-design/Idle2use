/** Shared building blocks for the How It Works section. */

import { Fragment } from "react";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export function HowHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-3xl pt-8 sm:pt-10">
      <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-green-400 uppercase">
        <Sparkles className="h-3.5 w-3.5 shrink-0" /> How it works
      </span>
      <h1 className="mt-4 text-3xl font-extrabold break-words sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

/** Step list item (navy surface). */
export function StepRow({
  n,
  title,
  desc,
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-extrabold text-white">
        {n}
      </span>
      <div className="min-w-0">
        <p className="font-bold text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{desc}</p>
      </div>
    </li>
  );
}

/** Horizontal (desktop) / vertical (mobile) flow of labelled chips. */
export function FlowRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3">
      {items.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <>
              <ArrowDown
                aria-hidden="true"
                className="mx-auto h-5 w-5 shrink-0 text-green-500/60 md:hidden"
              />
              <ArrowRight
                aria-hidden="true"
                className="hidden h-5 w-5 shrink-0 text-green-500/60 md:block"
              />
            </>
          )}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center md:flex-1">
            <p className="text-sm font-bold text-white">{label}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** Navigation card to another How It Works page (white, like landing cards). */
export function NavCard({
  to,
  Icon,
  title,
  desc,
}: {
  to: string;
  Icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl bg-white p-5 text-slate-900 shadow-lg transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-green-600">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-green-700">
        Open
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Closing CTA band. */
export function CtaBand({
  text,
  to,
  label,
}: {
  text: string;
  to: string;
  label: string;
}) {
  return (
    <div className="mt-12 rounded-3xl bg-green-600 p-6 text-center sm:p-8">
      <h2 className="text-xl font-extrabold text-white">{text}</h2>
      <Link
        to={to}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:w-auto"
      >
        {label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
