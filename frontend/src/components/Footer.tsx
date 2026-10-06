/** Shared site footer (public pages). */

import { Link } from "react-router-dom";
import { useAuth } from "../authContext";
import Logo from "./ui/Logo";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Find capacity", to: "/register" },
      { label: "List resources", to: "/register" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Categories", to: "/#categories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Trust & safety", to: "/how-it-works/trust" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Log in", to: "/login" },
      { label: "Create account", to: "/register" },
    ],
  },
];

export default function Footer() {
  const { health } = useAuth();
  const online = health.state === "ok";

  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="container-page py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-400">
              The capacity marketplace. Turn unused space, equipment and
              vehicles into opportunity — or find exactly what you need, when
              you need it.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold tracking-[0.14em] text-mist-100 uppercase">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-mist-400 transition-colors hover:text-brand-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-mist-500 sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} Idle2Use. Built for the hackathon demo.</span>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                online ? "bg-brand-500" : "bg-danger-500"
              }`}
            />
            {online
              ? "API online · All systems operational"
              : "API status unavailable"}
          </span>
        </div>
      </div>
    </footer>
  );
}
