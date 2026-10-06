/** Dedicated login page — split layout (brand panel + form). */

import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { formatApiError, useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import { Field, Input } from "../components/ui/Field";

const BENEFITS = [
  "Pick up exactly where your requests left off — nothing is lost between visits",
  "See new matches, booking updates and replies the moment they arrive",
  "Message providers directly and keep every confirmation in one thread",
];

export default function Login() {
  const { user, login, sessionMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  usePageTitle("Login");

  if (user) return <Navigate to="/app" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    clearSessionMessage();
    setBusy(true);
    try {
      await login({ username: username.trim(), password });
      navigate("/app", { replace: true });
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-ink-900 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-ink-950 p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-500/12 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px]"
        />

        <Logo className="relative" size="md" />

        <div className="relative">
          <h1 className="max-w-md text-3xl leading-tight font-extrabold text-mist-100">
            Welcome back to the{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              capacity marketplace.
            </span>
          </h1>
          <ul className="mt-8 space-y-3.5 text-sm text-mist-300">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-mist-500">
          Secure sign-in · Your requests, matches, bookings and messages, all
          waiting where you left them
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo size="sm" />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-mist-400 transition-colors hover:text-mist-100"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>

          <Link
            to="/"
            className="mb-6 hidden items-center gap-1.5 text-sm font-semibold text-mist-400 transition-colors hover:text-mist-100 lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="rounded-3xl border border-white/10 bg-ink-800 p-7 shadow-2xl shadow-ink-950/50 sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
              <User className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-mist-100">
              Sign in
            </h2>
            <p className="mt-1.5 text-sm text-mist-400">
              Sign in to reach your dashboard, matches and bookings.
            </p>

            {sessionMessage && (
              <Alert tone="warning" className="mt-5">
                {sessionMessage}
              </Alert>
            )}
            {error && (
              <Alert tone="danger" className="mt-5">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Username" htmlFor="login-username">
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mist-500" />
                  <Input
                    id="login-username"
                    className="pl-10"
                    placeholder="your_username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </Field>

              <Field label="Password" htmlFor="login-password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mist-500" />
                  <Input
                    id="login-password"
                    className="pr-11 pl-10"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-mist-500 transition-colors hover:bg-white/[0.08] hover:text-mist-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Button type="submit" disabled={busy} fullWidth size="lg">
                {busy ? "Signing in…" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-mist-400">
              New to Idle2Use?{" "}
              <Link
                to="/register"
                className="font-bold text-brand-400 transition-colors hover:text-brand-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
