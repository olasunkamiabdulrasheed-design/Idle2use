/** Brand mark — one implementation for every surface (nav, footer, auth, app). */

import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const SIZES = {
  sm: { tile: "h-7 w-7 rounded-lg", icon: "h-4 w-4", text: "text-base" },
  md: { tile: "h-8 w-8 rounded-xl", icon: "h-4.5 w-4.5", text: "text-lg" },
  lg: { tile: "h-10 w-10 rounded-xl", icon: "h-5 w-5", text: "text-xl" },
} as const;

export default function Logo({
  to = "/",
  size = "md",
  onClick,
  className = "",
}: {
  to?: string;
  size?: keyof typeof SIZES;
  onClick?: () => void;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2.5 rounded-xl font-extrabold text-mist-100 transition-opacity hover:opacity-90 ${className}`}
    >
      <span
        className={`flex ${s.tile} items-center justify-center bg-brand-600 shadow-lg shadow-brand-600/25`}
      >
        <Zap className={`${s.icon} text-white`} fill="currentColor" />
      </span>
      <span className={s.text}>
        Idle<span className="text-brand-400">2</span>Use
      </span>
    </Link>
  );
}
