/** Per-page header inside the app: identity, guidance, and an optional tip. */

import type { ReactNode } from "react";
import { Info } from "lucide-react";

export default function PageHeader({
  icon,
  title,
  subtitle,
  tip,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  tip?: string;
}) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/12 text-brand-400">
          {icon}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold text-mist-100 sm:text-2xl">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-mist-400">{subtitle}</p>
        </div>
      </div>
      {tip && (
        <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-mist-300">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
          <span className="min-w-0">{tip}</span>
        </p>
      )}
    </header>
  );
}
