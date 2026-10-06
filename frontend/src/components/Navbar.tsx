/** Public site header — shared by Landing/About/Contact/How It Works/404.
 * Sticky with a blurred backdrop; desktop nav with active indicator,
 * mobile hamburger drawer. */

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./ui/Logo";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
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

  // Escape closes the drawer; lock body scroll while it is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (to: string) =>
    to.startsWith("/#") ? false : location.pathname === to;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
      <div className="container-wide flex items-center justify-between gap-4 py-3.5">
        <Logo />

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(l.to)
                  ? "text-mist-100"
                  : "text-mist-400 hover:bg-white/[0.06] hover:text-mist-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-mist-200 transition-colors hover:bg-white/[0.06] hover:text-mist-100"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-500"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-xl border border-white/15 p-2 text-mist-100 transition-colors hover:bg-white/[0.06] lg:hidden"
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
            className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="site-mobile-menu"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-white/10 bg-ink-900 px-4 pt-3 pb-5 shadow-2xl lg:hidden"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                      isActive(l.to)
                        ? "bg-white/[0.08] text-mist-100"
                        : "text-mist-300 hover:bg-white/[0.06] hover:text-mist-100"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-mist-100 transition-colors hover:bg-white/[0.06]"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-brand-500"
              >
                Get started
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
