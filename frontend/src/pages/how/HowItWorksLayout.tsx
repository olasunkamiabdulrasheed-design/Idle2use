/** Shared shell for the How It Works section: Navbar + breadcrumb +
 * scroll reset + Footer. Nested routes render through <Outlet />. */

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

const CRUMBS: Record<string, string> = {
  "/how-it-works/request": "For Requesters",
  "/how-it-works/provider": "For Capacity Providers",
  "/how-it-works/matching": "How Matching Works",
  "/how-it-works/trust": "Trust & Reliability",
};

export default function HowItWorksLayout() {
  const { pathname } = useLocation();
  const crumb = CRUMBS[pathname];

  // Nested navigation keeps the layout mounted — reset scroll manually.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-900 text-mist-200">
      <Navbar />

      {crumb && (
        <nav
          aria-label="Breadcrumb"
          className="border-b border-white/10 bg-ink-950/50"
        >
          <div className="container-wide flex items-center gap-2 py-3.5 text-sm">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 rounded-lg font-semibold text-mist-400 transition-colors hover:text-mist-100"
            >
              <ArrowLeft className="h-4 w-4" /> How it works
            </Link>
            <span aria-hidden="true" className="text-mist-500">
              /
            </span>
            <span className="font-bold text-mist-100">{crumb}</span>
          </div>
        </nav>
      )}

      <main className="container-wide pb-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
