/** Dedicated login page — split layout (brand panel + form). */

import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { formatApiError, useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100";

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
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-[#0a1428] p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
            <ShieldCheck className="h-4 w-4" />
          </span>
          Idle<span className="text-green-500">2</span>Use
        </Link>
        <div>
          <h1 className="text-3xl leading-tight font-extrabold">
            Welcome back to the{" "}
            <span className="text-green-500">capacity marketplace.</span>
          </h1>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {[
              "Pick up where your requests left off",
              "Review new matches and booking updates",
              "Message providers and track confirmations",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">
          JWT sessions · refresh rotation · blacklisted logout
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <User className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Access your Idle2Use dashboard.
            </p>

            {sessionMessage && (
              <p
                role="status"
                className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
              >
                {sessionMessage}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="login-username"
                  className="text-xs font-bold text-slate-600"
                >
                  Username
                </label>
                <div className="relative mt-1">
                  <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-username"
                    className={`${inputClass} pl-9`}
                    placeholder="your_username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold text-slate-600"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    className={`${inputClass} pr-10 pl-9`}
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busy ? "Signing in…" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              New to Idle2Use?{" "}
              <Link
                to="/register"
                className="font-bold text-green-700 hover:underline"
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
