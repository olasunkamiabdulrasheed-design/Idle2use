import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  fetchHealth,
  fetchMe,
  fetchProtectedTest,
  formatApiError,
  getAccessToken,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./api/auth";
import type { AuthUser, HealthResponse } from "./types/auth";
import BookingsPanel from "./components/BookingsPanel";
import DashboardPanel from "./components/DashboardPanel";
import MessagesPanel from "./components/MessagesPanel";
import NotificationsBell from "./components/NotificationsBell";
import ResourcesPanel from "./components/ResourcesPanel";
import RequestsPanel from "./components/RequestsPanel";

type HealthState =
  | { state: "loading" }
  | { state: "ok"; data: HealthResponse }
  | { state: "error"; message: string };

type Tab = "dashboard" | "requests" | "resources" | "messages" | "bookings";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "requests", label: "Requests" },
  { id: "resources", label: "Resources" },
  { id: "messages", label: "Messages" },
  { id: "bookings", label: "Bookings" },
];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";

function HealthPill({ health }: { health: HealthState }) {
  if (health.state === "ok")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        API connected · {health.data.service}
      </span>
    );
  if (health.state === "error")
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        API unreachable
      </span>
    );
  return (
    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
      Checking API…
    </span>
  );
}

export default function App() {
  const [health, setHealth] = useState<HealthState>({ state: "loading" });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");

  // Registration form state.
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regFirst, setRegFirst] = useState("");
  const [regLast, setRegLast] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBusy, setRegBusy] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Login form state.
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((data) => {
        if (!cancelled) setHealth({ state: "ok", data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setHealth({
            state: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      });

    if (getAccessToken()) {
      fetchMe()
        .then((me) => {
          if (!cancelled) setUser(me);
        })
        .catch(() => {
          refreshAccessToken()
            .then(() => fetchMe())
            .then((me) => {
              if (!cancelled) setUser(me);
            })
            .catch(() => {
              if (!cancelled)
                setStatusMsg("Stored session expired. Please log in.");
            });
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRegBusy(true);
    try {
      const created = await registerUser({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        password_confirm: regPasswordConfirm,
        first_name: regFirst.trim(),
        last_name: regLast.trim(),
        phone: regPhone.trim(),
      });
      setStatusMsg(
        `Registered ${created.username}. Log in to continue — registration does not log you in.`,
      );
      setAuthMode("login");
      setLoginUsername(created.username);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setRegBusy(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoginBusy(true);
    try {
      const res = await loginUser({
        username: loginUsername.trim(),
        password: loginPassword,
      });
      setUser(res.user);
      setStatusMsg("");
      setTab("dashboard");
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    setError("");
    await logoutUser();
    setUser(null);
    setStatusMsg("Logged out.");
    setLoginPassword("");
  }

  async function handleDevProbe() {
    setError("");
    try {
      const res = await fetchProtectedTest();
      setStatusMsg(`${res.message} (user: ${res.user}).`);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  /* ------------------------- logged out: landing ------------------------- */
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100">
        <header className="bg-slate-900 text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <span className="text-lg font-extrabold tracking-tight">
              Idle<span className="text-green-500">2</span>Use
            </span>
            <HealthPill health={health} />
          </div>
        </header>

        <section className="bg-slate-900 px-6 pb-20 text-white">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold tracking-[0.2em] text-green-500 uppercase">
              Hackathon MVP · Capacity exchange platform
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl">
              Idle capacity, matched to people who need it.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Describe what you need in plain English — Idle2Use parses it,
              matches it against available spaces, equipment, and services,
              and gets you to a booking.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {[
                "Natural-language requests",
                "Smart matching engine",
                "Bookings + reviews",
              ].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 text-slate-300"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </section>

        <main className="mx-auto -mt-12 max-w-6xl px-6 pb-16">
          <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-xl">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {(["login", "register"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setAuthMode(mode);
                    setError("");
                  }}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold capitalize ${
                    authMode === mode
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-500"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {statusMsg && (
              <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                {statusMsg}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm break-all text-red-700">
                {error}
              </p>
            )}

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-3">
                <input
                  className={inputClass}
                  placeholder="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
                <input
                  className={inputClass}
                  placeholder="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loginBusy}
                  className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {loginBusy ? "Logging in…" : "Log in"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="mt-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="username *"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="email *"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="password *"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="confirm password *"
                    type="password"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="first name"
                    value={regFirst}
                    onChange={(e) => setRegFirst(e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="last name"
                    value={regLast}
                    onChange={(e) => setRegLast(e.target.value)}
                  />
                </div>
                <input
                  className={inputClass}
                  placeholder="phone (optional)"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={regBusy}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {regBusy ? "Creating account…" : "Create account"}
                </button>
              </form>
            )}

            <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={handleDevProbe}
                className="underline hover:text-slate-700"
              >
                JWT probe
              </button>
              <span>Tokens in localStorage (MVP · see src/api/auth.ts)</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* -------------------------- logged in: shell --------------------------- */
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <span className="text-lg font-extrabold tracking-tight">
            Idle<span className="text-green-500">2</span>Use
          </span>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  tab === t.id
                    ? "bg-green-700 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <NotificationsBell />
            <span className="hidden text-sm text-slate-300 sm:inline">
              {user.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {tab === "dashboard" && <DashboardPanel />}
        {tab === "requests" && <RequestsPanel />}
        {tab === "resources" && <ResourcesPanel />}
        {tab === "messages" && <MessagesPanel myUsername={user.username} />}
        {tab === "bookings" && (
          <BookingsPanel
            myUserId={user.id}
            onBooked={() => setTab("bookings")}
          />
        )}

        <footer className="flex items-center justify-between pb-4 text-xs text-slate-400">
          <HealthPill health={health} />
          <span>Idle2Use hackathon MVP · Django + React</span>
        </footer>
      </main>
    </div>
  );
}
