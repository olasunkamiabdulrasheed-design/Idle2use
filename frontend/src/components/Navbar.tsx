/** Public site header — shared by Landing/About/Contact/404.
 * Desktop: logo + nav + auth CTAs. Mobile: logo + hamburger drawer. */

import { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/#how" },
  { label: "Categories", to: "/#categories" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="relative border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-extrabold text-white focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none rounded"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </span>
          Idle<span className="text-green-500">2</span>Use
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="rounded focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-lg border border-white/20 p-2 text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="site-mobile-menu"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-white/10 bg-[#0a1428] px-4 py-4 shadow-2xl md:hidden"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/20 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-green-700"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
