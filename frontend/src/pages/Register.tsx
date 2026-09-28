/** Dedicated register page — distinct from login: centered card on navy. */

import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { formatApiError, useAuth } from "../authContext";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const username = await register({
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
      });
      setNotice(
        `Account created for ${username}. Redirecting to sign in…`,
      );
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1428]">
      {/* Compact header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Idle<span className="text-green-500">2</span>Use
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:py-14">
        {/* Left: benefits */}
        <div className="text-white">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="text-3xl font-extrabold">
            Create your free account
          </h1>
          <p className="mt-2 max-w-md text-slate-300">
            Join the marketplace where unused space, equipment and vehicles
            find the people who need them.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              ["Post requests in plain English", "AI parses your need into a structured request."],
              ["Get scored matches instantly", "Five weighted factors: location, time, capacity, type, requirements."],
              ["Book with confidence", "Conflict-checked bookings and reviews after completion."],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white">
            <User className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold">Register</h2>
          <p className="mt-1 text-sm text-slate-500">
            Registration does not log you in — sign in afterwards.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {notice}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              className={inputClass}
              placeholder="username *"
              autoComplete="username"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              required
            />
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} pl-9`}
                type="email"
                placeholder="email *"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputClass}
                type="password"
                placeholder="password *"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
              <input
                className={inputClass}
                type="password"
                placeholder="confirm *"
                autoComplete="new-password"
                value={form.password_confirm}
                onChange={(e) => set("password_confirm", e.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="first name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="last name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
            </div>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="phone (optional)"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? "Creating account…" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-bold text-green-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
