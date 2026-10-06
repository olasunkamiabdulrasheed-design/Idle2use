/** Contact page — uses only contact methods that exist in this project. */

import { ArrowRight, MessagesSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Contact() {
  const { user } = useAuth();
  usePageTitle("Contact");

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-900 text-mist-200">
      <Navbar />

      <main className="container-page py-12 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand-300 uppercase">
            <MessagesSquare className="h-3.5 w-3.5" /> Contact
          </span>
          <h1 className="mt-5 text-3xl font-extrabold text-mist-100 sm:text-4xl">
            Get in touch
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-mist-300 sm:text-base">
            Idle2Use is a hackathon MVP, and everything here is built to be
            honest about what it can and cannot do. All communication happens
            inside the platform — there is no phone line or support inbox behind
            the curtain. So rather than list a contact address that would go
            nowhere, here are the channels that genuinely work today.
          </p>
        </div>

        {/* Existing, working contact channels */}
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
              <MessagesSquare className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-bold text-mist-100">In-app messaging</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist-400">
              This is the working contact method in the project: private
              conversations between requesters and providers. Threads are
              restricted to their participants at the API level, so what you
              discuss stays between the two of you — and stays attached to the
              booking it belongs to.
            </p>
            <Link
              to={user ? "/app/messages" : "/login"}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-500"
            >
              {user ? "Open messages" : "Sign in to message"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
              <Users className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-bold text-mist-100">
              Requester ↔ provider
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mist-400">
              Every booking records both sides — the person requesting and the
              owner of the resource — so once an exchange is underway each of
              you can reach the other directly, without either side having to
              hand out personal contact details up front.
            </p>
            <Link
              to={user ? "/app/bookings" : "/register"}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-mist-100 transition-colors hover:bg-white/[0.08]"
            >
              {user ? "View bookings" : "Create an account"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* CTA back to platform */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-600/20 via-ink-800 to-ink-800 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-extrabold text-mist-100">
            Back to the platform
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist-300">
            Describe what you need in a sentence, review the matches that
            actually fit, and take it from there — or list something you have
            spare and let the requests come to you.
          </p>
          <Link
            to={user ? "/app" : "/register"}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-colors hover:bg-brand-500 sm:w-auto"
          >
            {user ? "Go to dashboard" : "Get started"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
