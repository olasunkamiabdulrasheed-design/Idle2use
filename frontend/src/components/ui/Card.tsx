/** Raised surface used for every panel, card and list group in the product. */

import type { ReactNode } from "react";

type Tone = "raised" | "sunken" | "outline" | "brand";

const TONES: Record<Tone, string> = {
  raised: "border-white/10 bg-ink-800",
  sunken: "border-white/5 bg-ink-850",
  outline: "border-white/10 bg-transparent",
  brand: "border-brand-500/25 bg-brand-500/[0.07]",
};

export default function Card({
  tone = "raised",
  padded = true,
  className = "",
  children,
}: {
  tone?: Tone;
  padded?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-2xl border",
        TONES[tone],
        padded ? "p-5 sm:p-6" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
