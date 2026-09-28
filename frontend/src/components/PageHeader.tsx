/** Per-page header: distinct identity + guidance for each screen. */

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
    <header className="mb-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl">
          {icon}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold text-slate-900 sm:text-2xl">
            {title}
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {tip && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {tip}
        </p>
      )}
    </header>
  );
}
