/** Contact page — uses only contact methods that exist in this project. */

import { ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";

export default function Contact() {
  const { user } = useAuth();
  usePageTitle("Contact");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a1428] text-white">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-[11px] font-bold tracking-widest text-green-400 uppercase">
          <MessageSquare className="h-3.5 w-3.5" /> Contact
        </span>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          Idle2Use is a hackathon MVP, so all communication happens inside the
          platform itself. There is no published phone number or support email
          — we only list channels that actually exist in this product.
        </p>

        {/* Existing, working contact channels */}
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/20 text-green-400">
              <MessageSquare className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-bold">In-app messaging</h2>
            <p className="mt-1 text-sm text-slate-400">
              The working contact method in this project: private conversations
              between requesters and providers. Only conversation participants
              can read or send messages — enforced by the API.
            </p>
            <Link
              to={user ? "/app/messages" : "/login"}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              {user ? "Open Messages" : "Sign in to message"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <h2 className="font-bold">Requester ↔ provider</h2>
            <p className="mt-1 text-sm text-slate-400">
              Every booking shows both parties (requester and resource owner),
              so each side can reach the other directly through the platform
              once an exchange is underway.
            </p>
            <Link
              to={user ? "/app/bookings" : "/register"}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              {user ? "View Bookings" : "Create an account"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* CTA back to platform */}
        <div className="mt-10 rounded-3xl bg-green-600 p-6 text-center">
          <h2 className="text-xl font-extrabold">Back to the platform</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-green-50">
            Describe what you need, find matches, and take it from there.
          </p>
          <Link
            to={user ? "/app" : "/register"}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 sm:w-auto"
          >
            {user ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
