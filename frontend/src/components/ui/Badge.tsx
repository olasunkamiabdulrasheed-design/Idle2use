/** Small status/label pill. Tone carries the meaning, so callers never
 * hand-pick colours for statuses. */

import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "warning"
  | "danger"
  | "muted"
  | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-white/15 bg-white/[0.06] text-mist-200",
  brand: "border-brand-500/30 bg-brand-500/15 text-brand-300",
  warning: "border-warn-400/30 bg-warn-400/15 text-warn-300",
  danger: "border-danger-500/30 bg-danger-500/15 text-danger-400",
  muted: "border-white/10 bg-white/[0.03] text-mist-400",
  info: "border-sky-400/30 bg-sky-400/15 text-sky-300",
};

export default function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
        TONES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

/** Maps every backend status string used in this app to a badge tone. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "confirmed":
    case "active":
    case "matched":
    case "completed":
      return "brand";
    case "pending":
    case "expired":
      return "warning";
    case "cancelled":
      return "danger";
    case "fulfilled":
    case "inactive":
      return "muted";
    default:
      return "neutral";
  }
}
