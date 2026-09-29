/** Shared site footer (landing + auth pages). */

import { Globe, Mail, MessageCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Find capacity", to: "/register" },
      { label: "List resources", to: "/register" },
      { label: "How it works", to: "/#how" },
      { label: "Categories", to: "/#categories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Trust & safety", to: "/#trust" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Login", to: "/login" },
      { label: "Create account", to: "/register" },
    ],
  },
];

export default function Footer() {
  const { health } = useAuth();

  return (
    <footer className="border-t border-white/10 bg-[#070e1d] text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <span className="flex items-center gap-2 text-lg font-extrabold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
                <Zap className="h-4 w-4 text-white" fill="currentColor" />
              </span>
              Idle<span className="text-green-500">2</span>Use
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              The capacity marketplace. Turn unused space, equipment and
              vehicles into opportunity — or find exactly what you need, when
              you need it.
            </p>
            <div className="mt-4 flex gap-3">
              {[Globe, Mail, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="rounded-lg border border-white/10 p-2 transition-colors hover:border-green-500 hover:text-green-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold tracking-widest text-white uppercase">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="transition-colors hover:text-green-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-xs sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} Idle2Use. Built for the hackathon demo.</span>
          <span className="inline-flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                health.state === "ok" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {health.state === "ok"
              ? "API Online · All systems operational"
              : "API status unavailable"}
          </span>
        </div>
      </div>
    </footer>
  );
}
