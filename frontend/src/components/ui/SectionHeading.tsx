/** Section rhythm for marketing and app pages: an eyebrow, a heading and an
 * optional lead paragraph, spaced consistently everywhere. */

import type { ReactNode } from "react";

export function Eyebrow({
  icon,
  children,
  className = "",
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={[
        "inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-brand-400 uppercase",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      {children}
    </p>
  );
}

/** Pill-shaped eyebrow used in page heroes. */
export function EyebrowPill({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand-300 uppercase">
      {icon}
      {children}
    </span>
  );
}

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={[
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-2.5 text-2xl font-extrabold text-mist-100 sm:text-3xl">
        {title}
      </h2>
      {lead && (
        <p className="mt-3 text-sm leading-relaxed text-mist-400 sm:text-base">
          {lead}
        </p>
      )}
    </div>
  );
}
