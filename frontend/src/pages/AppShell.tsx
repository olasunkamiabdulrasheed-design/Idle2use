/** Authenticated shell: sidebar navigation + topbar + routed app pages.
 * Desktop: fixed sidebar. Mobile: hamburger + off-canvas drawer with
 * backdrop, Escape close, and a reusable back control on sub-pages. */

import { useEffect, useState } from "react";
import {
  Boxes,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";
import MobileBackButton from "../components/MobileBackButton";
import NotificationsBell from "../components/NotificationsBell";
import PageHeader from "../components/PageHeader";
import BookingsPanel from "../components/BookingsPanel";
import DashboardPanel from "../components/DashboardPanel";
import MessagesPanel from "../components/MessagesPanel";
import ResourcesPanel from "../components/ResourcesPanel";
import RequestsPanel from "../components/RequestsPanel";

const NAV = [
  { to: "/app", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/find", label: "Find Capacity", icon: Search },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/app/resources", label: "Resources", icon: Boxes },
  { to: "/app/profile", label: "Profile", icon: UserIcon },
];

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/": "Dashboard",
  "/app/find": "Requests",
  "/app/messages": "Messages",
  "/app/bookings": "Bookings",
  "/app/resources": "Resources",
  "/app/profile": "Profile",
};

function PageHeaderFor({ path, username }: { path: string; username: string }) {
  switch (path) {
    case "/app":
    case "/app/":
      return (
        <PageHeader
          icon={<LayoutDashboard className="h-5 w-5 text-white" />}
          title="Dashboard"
          subtitle="Overview of your requests, matches, bookings and messages."
          tip="Describe what you need in plain English — the AI composer structures it and runs matching instantly."
        />
      );
    case "/app/find":
      return (
        <PageHeader
          icon={<Search className="h-5 w-5 text-white" />}
          title="Find Capacity"
          subtitle="Post requests, browse active ones and review scored matches."
          tip="Matches score location (30%), time (25%), capacity (20%), type (15%) and requirements (10%)."
        />
      );
    case "/app/messages":
      return (
        <PageHeader
          icon={<MessageSquare className="h-5 w-5 text-white" />}
          title="Messages"
          subtitle="Private conversations with requesters and providers."
          tip="Only conversation participants can read or send messages — enforced by the API."
        />
      );
    case "/app/bookings":
      return (
        <PageHeader
          icon={<CalendarDays className="h-5 w-5 text-white" />}
          title="Bookings & Reviews"
          subtitle="Lifecycle: pending → confirmed → completed. Reviews unlock after completion."
          tip="Providers confirm or decline requests; both sides can cancel, and double-bookings are blocked."
        />
      );
    case "/app/resources":
      return (
        <PageHeader
          icon={<Boxes className="h-5 w-5 text-white" />}
          title="My Resources"
          subtitle="List capacity you offer and define availability windows."
          tip="Once a resource and availability exist, matching runs automatically whenever a request appears."
        />
      );
    case "/app/profile":
      return (
        <PageHeader
          icon={<UserIcon className="h-5 w-5 text-white" />}
          title="Profile"
          subtitle={`Account details and verification status for ${username}.`}
          tip="Verification flags build trust with the other side of every exchange."
        />
      );
    default:
      return null;
  }
}

export default function AppShell() {
  const { user, logout, restoring } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isRoot = location.pathname === "/app" || location.pathname === "/app/";

  usePageTitle(TITLES[location.pathname]);

  // Close the drawer on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Restoring session…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <NavLink
        to="/app"
        className="flex items-center gap-2 px-5 py-5 text-lg font-extrabold text-white"
        onClick={() => setMenuOpen(false)}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
          <Zap className="h-4 w-4 text-white" fill="currentColor" />
        </span>
        Idle<span className="text-green-500">2</span>Use
      </NavLink>
      <nav
        aria-label="Dashboard navigation"
        className="flex-1 space-y-1 px-3"
      >
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/5 p-4">
        <span className="flex items-center gap-2 text-xs font-bold text-white">
          <LifeBuoy className="h-4 w-4 text-green-400" /> Need help?
        </span>
        <p className="mt-1 text-[11px] text-slate-400">
          See How It Works on the landing page for a quick walkthrough.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          void logout();
        }}
        className="m-3 mt-0 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#0a1428] px-4 py-3 text-white lg:hidden">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="dashboard-mobile-menu"
          className="rounded-lg border border-white/20 p-2 hover:bg-white/10"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        <NavLink to="/app" className="flex items-center gap-2 font-extrabold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
            <Zap className="h-4 w-4" fill="currentColor" />
          </span>
          Idle<span className="text-green-500">2</span>Use
        </NavLink>
        <div className="ml-auto flex items-center gap-3">
          <NotificationsBell />
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Log out"
            className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Off-canvas drawer (mobile) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="dashboard-mobile-menu"
        aria-label="Dashboard menu"
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-[#0a1428] transition-transform duration-200 lg:translate-x-0 lg:block ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside drawer (mobile) */}
        <button
          type="button"
          aria-label="Close menu"
          className="absolute top-4 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 hidden items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-sm text-slate-700 focus:border-green-600 focus:bg-white focus:outline-none"
              placeholder="Search resources, locations, or requests…"
              aria-label="Search"
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <NotificationsBell />
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                {user.username.slice(0, 2).toUpperCase()}
              </span>
              <span className="max-w-32 truncate">{user.username}</span>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {!isRoot && <MobileBackButton to="/app" label="Back to Dashboard" />}
          <PageHeaderFor path={location.pathname} username={user.username} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ---------- thin routed pages (each page = header + working panel) ------ */

export function DashboardPage() {
  return <DashboardPanel />;
}

export function FindPage() {
  return <RequestsPanel />;
}

export function MessagesPage() {
  const { user } = useAuth();
  return <MessagesPanel myUsername={user?.username ?? ""} />;
}

export function BookingsPage() {
  const { user } = useAuth();
  return <BookingsPanel myUserId={user?.id ?? 0} />;
}

export function ResourcesPage() {
  return <ResourcesPanel />;
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-extrabold text-white">
          {user.username.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold text-slate-900">
            {user.first_name || user.last_name
              ? `${user.first_name} ${user.last_name}`.trim()
              : user.username}
          </h2>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      <dl className="mt-5 space-y-2 text-sm">
        {[
          ["Phone", user.profile.phone || "—"],
          ["Phone verified", user.profile.is_phone_verified ? "Yes" : "Not yet"],
          [
            "Identity verified",
            user.profile.is_identity_verified ? "Yes" : "Not yet",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 border-t border-slate-100 pt-2"
          >
            <dt className="text-slate-500">{label}</dt>
            <dd
              className={
                value === "Yes"
                  ? "font-bold text-green-700"
                  : "text-right font-semibold text-slate-800"
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={() => void logout()}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </section>
  );
}
