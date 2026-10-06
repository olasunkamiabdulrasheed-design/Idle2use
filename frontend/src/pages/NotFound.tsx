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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-ink-900 text-mist-200">
      <Navbar />

      <main className="relative flex flex-1 items-center justify-center px-4 py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[100px]"
        />
        <div className="relative w-full max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/12 text-brand-400">
            <Compass className="h-8 w-8" />
          </span>
          <p className="mt-7 text-6xl font-extrabold text-brand-500">404</p>
          <h1 className="mt-3 text-xl font-extrabold text-mist-100 sm:text-2xl">
            This page doesn't exist
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mist-400">
            Nothing lives at this address. The link may be broken, the page may
            have moved, or it may never have existed at all — either way, there
            is nothing to see here.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-500 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
            {user && (
              <Link
                to="/app"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold text-mist-100 transition-colors hover:bg-white/[0.06] sm:w-auto"
              >
                Go to dashboard
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
