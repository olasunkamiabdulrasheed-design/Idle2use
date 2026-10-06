/** Metric tile for the dashboard. */

import type { ReactNode } from "react";

export default function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-4 transition-colors hover:border-white/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl transition-opacity group-hover:opacity-70"
      />
      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-wide text-mist-400 uppercase">
            {label}
          </p>
          <p className="text-2xl leading-tight font-extrabold text-mist-100">
            {value}
          </p>
        </div>
      </div>
      {hint && <p className="relative mt-2 text-[11px] text-mist-500">{hint}</p>}
    </div>
  );
}
