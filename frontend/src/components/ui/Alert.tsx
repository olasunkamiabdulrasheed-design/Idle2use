/** Inline feedback banner — notices, errors, warnings and tips. */

import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONES: Record<AlertTone, { wrap: string; Icon: typeof Info }> = {
  info: { wrap: "border-sky-400/25 bg-sky-400/10 text-sky-200", Icon: Info },
  success: {
    wrap: "border-brand-500/25 bg-brand-500/10 text-brand-300",
    Icon: CheckCircle2,
  },
  warning: {
    wrap: "border-warn-400/30 bg-warn-400/10 text-warn-300",
    Icon: AlertTriangle,
  },
  danger: {
    wrap: "border-danger-500/30 bg-danger-500/10 text-danger-400",
    Icon: XCircle,
  },
};

export default function Alert({
  tone = "info",
  children,
  className = "",
}: {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}) {
  const { wrap, Icon } = TONES[tone];

  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={[
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        wrap,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
