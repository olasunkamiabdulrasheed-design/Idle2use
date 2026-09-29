/** 404 — branded not-found page. */

import { ArrowLeft, Compass, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useAuth } from "../authContext";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0a1428] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
              <Search className="h-4 w-4" />
            </span>
            Idle<span className="text-green-500">2</span>Use
          </Link>
        </div>
      </header>

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
