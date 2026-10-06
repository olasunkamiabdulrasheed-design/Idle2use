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
    <div className="max-w-3xl pt-12 sm:pt-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand-300 uppercase">
        <Sparkles className="h-3.5 w-3.5 shrink-0" /> How it works
      </span>
      <h1 className="mt-5 text-3xl leading-tight font-extrabold break-words text-mist-100 sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mist-300 sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

/** Step list item. */
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
    <li className="flex gap-4 rounded-2xl border border-white/10 bg-ink-800 p-4 transition-colors hover:border-white/20 sm:p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-sm font-extrabold text-brand-400">
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="font-bold text-mist-100">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-mist-400">{desc}</p>
      </div>
    </li>
  );
}

/** Horizontal (desktop) / vertical (mobile) flow of labelled chips. */
export function FlowRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-2.5">
      {items.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <>
              <ArrowDown
                aria-hidden="true"
                className="mx-auto h-5 w-5 shrink-0 text-brand-500/50 md:hidden"
              />
              <ArrowRight
                aria-hidden="true"
                className="hidden h-5 w-5 shrink-0 text-brand-500/50 md:block"
              />
            </>
          )}
          <div className="rounded-2xl border border-white/10 bg-ink-850 px-4 py-3.5 text-center md:flex-1">
            <p className="text-sm font-bold text-mist-100">{label}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** Navigation card to another How It Works page. */
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
      className="group flex flex-col rounded-2xl border border-white/10 bg-ink-800 p-5 transition-colors hover:border-brand-500/40 focus-visible:outline-none"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-bold text-mist-100">{title}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-mist-400">
        {desc}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-400">
        Open
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Closing CTA band. `subtext` carries the supporting sentence that sits
 * under the headline — it is what turns the band from a shout into an offer. */
export function CtaBand({
  text,
  subtext,
  to,
  label,
}: {
  text: string;
  subtext?: string;
  to: string;
  label: string;
}) {
  return (
    <div className="mt-14 overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-600/20 via-ink-800 to-ink-800 p-8 text-center sm:p-12">
      <h2 className="text-2xl font-extrabold text-mist-100 sm:text-3xl">
        {text}
      </h2>
      {subtext && (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist-300 sm:text-base">
          {subtext}
        </p>
      )}
      <Link
        to={to}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-colors hover:bg-brand-500 sm:w-auto"
      >
        {label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
