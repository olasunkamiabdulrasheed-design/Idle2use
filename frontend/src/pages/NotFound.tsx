/** 404 — branded not-found page. */

import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFound() {
  const { user } = useAuth();
  usePageTitle("Page not found");

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0a1428] text-white">
      <Navbar />

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600/20 text-green-400">
            <Compass className="h-8 w-8" />
          </span>
          <p className="mt-6 text-6xl font-extrabold text-green-500">404</p>
          <h1 className="mt-2 text-xl font-extrabold sm:text-2xl">
            This page doesn't exist
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            The link may be broken, or the page may have moved. Let's get you
            back on track.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            {user && (
              <Link
                to="/app"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 sm:w-auto"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
