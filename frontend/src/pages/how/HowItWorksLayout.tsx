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
    <div className="min-h-screen overflow-x-hidden bg-[#0a1428] text-white">
      <Navbar />
      <main className="w-full px-4 pb-6 sm:px-8 lg:px-12 2xl:px-16">
        {crumb && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 border-b border-white/10 py-3 text-sm text-slate-400"
          >
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 rounded hover:text-white focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" /> How It Works
            </Link>
            <span aria-hidden="true" className="text-slate-600">
              /
            </span>
            <span className="font-semibold text-white">{crumb}</span>
          </nav>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
