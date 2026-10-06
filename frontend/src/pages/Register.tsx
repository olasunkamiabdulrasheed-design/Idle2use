/** Dedicated register page — benefits panel + account form. */

import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { formatApiError, useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import { Field, Input } from "../components/ui/Field";

const BENEFITS: [string, string][] = [
  [
    "Describe what you need in plain English",
    "Write it the way you would say it out loud. The parser turns your sentence into a structured request — category, location, capacity, date and time — and shows you what it read before anything is saved.",
  ],
  [
    "Get scored matches straight away",
    "Your request is checked against every resource that is genuinely free, then ranked by five weighted factors: location, time, capacity, resource type and requirements. Each match comes with the reasons it was chosen.",
  ],
  [
    "Book with confidence",
    "Bookings are clash-checked, so two people cannot claim the same resource at once. Both sides confirm, messages stay attached to the booking, and reviews unlock once it is completed.",
  ],
];

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
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  usePageTitle("Register");

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
      setNotice(`Account created for ${username}. Redirecting to sign in…`);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const passwordType = showPasswords ? "text" : "password";

  return (
    <div className="min-h-screen bg-ink-900 text-mist-200">
      {/* Compact header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
        <div className="container-page flex items-center justify-between py-3.5">
          <Logo />
          <Link
            to="/login"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-mist-100 transition-colors hover:bg-white/[0.06]"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_460px] lg:py-16">
        {/* Left: benefits */}
        <div>
          <Link
            to="/"
            className="mb-7 inline-flex items-center gap-1.5 text-sm font-semibold text-mist-400 transition-colors hover:text-mist-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <h1 className="text-3xl leading-tight font-extrabold text-mist-100 sm:text-4xl">
            Create your free account
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist-300 sm:text-base">
            Join the marketplace where unused space, storage, vehicles and
            equipment find the people who need them. Whether you are hunting for
            somewhere to work this week or you have a resource sitting idle, one
            account covers both sides.
          </p>

          <ul className="mt-10 space-y-5">
            {BENEFITS.map(([title, desc]) => (
              <li key={title} className="flex gap-3.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                <div className="min-w-0">
                  <p className="font-bold text-mist-100">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mist-400">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="rounded-3xl border border-white/10 bg-ink-800 p-6 shadow-2xl shadow-ink-950/50 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
            <User className="h-5 w-5" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-mist-100">
            Register
          </h2>
          <p className="mt-1.5 text-sm text-mist-400">
            Registration doesn't log you in — you'll sign in next.
          </p>

          {error && (
            <Alert tone="danger" className="mt-5">
              {error}
            </Alert>
          )}
          {notice && (
            <Alert tone="success" className="mt-5">
              {notice}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Username" htmlFor="reg-username">
              <Input
                id="reg-username"
                placeholder="your_username"
                autoComplete="username"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                required
              />
            </Field>

            <Field label="Email" htmlFor="reg-email">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mist-500" />
                <Input
                  id="reg-email"
                  className="pl-10"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </div>
            </Field>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                aria-pressed={showPasswords}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mist-400 transition-colors hover:text-mist-200"
              >
                {showPasswords ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {showPasswords ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Password" htmlFor="reg-password">
                <Input
                  id="reg-password"
                  type={passwordType}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
              </Field>
              <Field label="Confirm" htmlFor="reg-confirm">
                <Input
                  id="reg-confirm"
                  type={passwordType}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.password_confirm}
                  onChange={(e) => set("password_confirm", e.target.value)}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" htmlFor="reg-first">
                <Input
                  id="reg-first"
                  placeholder="Optional"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                />
              </Field>
              <Field label="Last name" htmlFor="reg-last">
                <Input
                  id="reg-last"
                  placeholder="Optional"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Phone" htmlFor="reg-phone" hint="Optional.">
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mist-500" />
                <Input
                  id="reg-phone"
                  className="pl-10"
                  placeholder="+234…"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </Field>

            <Button type="submit" disabled={busy} fullWidth size="lg">
              {busy ? "Creating account…" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-mist-400">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-bold text-brand-400 transition-colors hover:text-brand-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
