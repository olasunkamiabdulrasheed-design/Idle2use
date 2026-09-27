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
import ResourcesPanel from "./components/ResourcesPanel";
import RequestsPanel from "./components/RequestsPanel";

type HealthState =
  | { state: "loading" }
  | { state: "ok"; data: HealthResponse }
  | { state: "error"; message: string };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-lg font-bold text-slate-900">{children}</h2>
  );
}

export default function App() {
  const [health, setHealth] = useState<HealthState>({ state: "loading" });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [statusMsg, setStatusMsg] = useState("Not authenticated.");
  const [error, setError] = useState("");

  // Registration form state.
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regFirst, setRegFirst] = useState("");
  const [regLast, setRegLast] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBusy, setRegBusy] = useState(false);

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

    // Restore session if tokens were persisted (MVP localStorage strategy).
    if (getAccessToken()) {
      fetchMe()
        .then((me) => {
          if (!cancelled) {
            setUser(me);
            setStatusMsg(`Authenticated as ${me.username}.`);
          }
        })
        .catch(() => {
          refreshAccessToken()
            .then(() => fetchMe())
            .then((me) => {
              if (!cancelled) {
                setUser(me);
                setStatusMsg(`Authenticated as ${me.username} (token refreshed).`);
              }
            })
            .catch(() => {
              if (!cancelled) setStatusMsg("Stored session expired. Please log in.");
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
        `Registered ${created.username}. Now log in — registration does not log you in.`,
      );
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
      setStatusMsg(`Authenticated as ${res.user.username}.`);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleReloadMe() {
    setError("");
    try {
      const me = await fetchMe();
      setUser(me);
      setStatusMsg(`Authenticated as ${me.username}.`);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  async function handleProtectedTest() {
    setError("");
    try {
      const res = await fetchProtectedTest();
      setStatusMsg(`${res.message} (user: ${res.user}).`);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  async function handleRefresh() {
    setError("");
    try {
      await refreshAccessToken();
      setStatusMsg("Access token refreshed.");
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  async function handleLogout() {
    setError("");
    await logoutUser();
    setUser(null);
    setStatusMsg("Logged out. Refresh token blacklisted; access token expires shortly.");
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-100 p-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Stage 1 health check (unchanged behavior). */}
        <section className="rounded-2xl bg-white p-8 shadow">
          <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
            Idle2Use · Stage 1 + 2 + 3 + 4
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Frontend → Backend check
          </h1>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {health.state === "loading" && (
              <p className="text-slate-600">Contacting the API…</p>
            )}
            {health.state === "ok" && (
              <>
                <p className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                  Connected
                </p>
                <pre className="mt-3 overflow-x-auto font-mono text-sm text-slate-800">
                  {JSON.stringify(health.data, null, 2)}
                </pre>
              </>
            )}
            {health.state === "error" && (
              <p className="font-mono text-sm break-all text-red-700">{health.message}</p>
            )}
          </div>
        </section>

        {/* Stage 2 authentication. */}
        <section className="rounded-2xl bg-white p-8 shadow">
          <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
            Stage 2 · Authentication
          </p>
          <p className="mt-2 text-sm text-slate-700">{statusMsg}</p>
          {error && (
            <p className="mt-2 rounded-lg bg-red-50 p-3 font-mono text-sm break-all text-red-700">
              {error}
            </p>
          )}

          {user ? (
            <div className="mt-4 space-y-4">
              <SectionTitle>Authenticated user</SectionTitle>
              <pre className="overflow-x-auto rounded-xl bg-slate-50 p-4 font-mono text-sm text-slate-800">
                {JSON.stringify(user, null, 2)}
              </pre>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleReloadMe}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Reload /me
                </button>
                <button
                  type="button"
                  onClick={handleProtectedTest}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900"
                >
                  Call protected-test
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900"
                >
                  Refresh token
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <form onSubmit={handleRegister} className="space-y-3">
                <SectionTitle>Register</SectionTitle>
                <input className={inputClass} placeholder="username *" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
                <input className={inputClass} placeholder="email *" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                <input className={inputClass} placeholder="password *" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                <input className={inputClass} placeholder="password_confirm *" type="password" value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} required />
                <input className={inputClass} placeholder="first_name (optional)" value={regFirst} onChange={(e) => setRegFirst(e.target.value)} />
                <input className={inputClass} placeholder="last_name (optional)" value={regLast} onChange={(e) => setRegLast(e.target.value)} />
                <input className={inputClass} placeholder="phone (optional)" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                <button
                  type="submit"
                  disabled={regBusy}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {regBusy ? "Registering…" : "POST /api/auth/register/"}
                </button>
              </form>

              <form onSubmit={handleLogin} className="space-y-3">
                <SectionTitle>Login</SectionTitle>
                <input className={inputClass} placeholder="username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required />
                <input className={inputClass} placeholder="password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                <button
                  type="submit"
                  disabled={loginBusy}
                  className="w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loginBusy ? "Logging in…" : "POST /api/auth/login/"}
                </button>
                <p className="text-xs text-slate-500">
                  Tokens are stored in localStorage for this MVP (XSS-readable —
                  see src/api/auth.ts). Short-lived access + blacklisted refresh
                  on logout.
                </p>
              </form>
            </div>
          )}
        </section>

        {/* Stage 4 capacity requests + Stage 3 resources (authenticated only). */}
        {user && <RequestsPanel />}
        {user && <ResourcesPanel />}
      </div>
    </main>
  );
}
