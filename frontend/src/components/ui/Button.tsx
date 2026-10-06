/** Shared button — the single source of truth for action styling.
 * Renders a router <Link> when `to` is given, otherwise a <button>. */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500",
  secondary:
    "border border-white/15 bg-white/[0.04] text-mist-100 hover:border-white/30 hover:bg-white/[0.08]",
  ghost: "text-mist-300 hover:bg-white/[0.06] hover:text-mist-100",
  danger:
    "border border-danger-500/30 bg-danger-500/10 text-danger-400 hover:bg-danger-500/20",
  subtle: "bg-ink-700 text-mist-100 hover:bg-ink-600",
};

const SIZES: Record<Size, string> = {
  sm: "gap-1.5 px-3 py-1.5 text-xs rounded-lg",
  md: "gap-2 px-4 py-2.5 text-sm rounded-xl",
  lg: "gap-2 px-6 py-3 text-sm rounded-xl sm:text-base",
};

const BASE =
  "inline-flex items-center justify-center font-bold transition-colors disabled:pointer-events-none disabled:opacity-50";

function classes(variant: Variant, size: Size, fullWidth: boolean, className: string) {
  return [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  to,
  ...rest
}: CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    to?: string;
  }) {
  const cls = classes(variant, size, fullWidth, className);

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
