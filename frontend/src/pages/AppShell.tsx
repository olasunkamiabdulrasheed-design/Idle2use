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
} from "lucide-react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../authContext";
import { usePageTitle } from "../hooks/usePageTitle";
import MobileBackButton from "../components/MobileBackButton";
import NotificationsBell from "../components/NotificationsBell";
import PageHeader from "../components/PageHeader";
import Logo from "../components/ui/Logo";
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
  "/app/find": "Find Capacity",
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
          icon={<LayoutDashboard className="h-5 w-5" />}
          title="Dashboard"
          subtitle="Your requests, matches, bookings and messages at a glance."
        />
      );
    case "/app/find":
      return (
        <PageHeader
          icon={<Search className="h-5 w-5" />}
          title="Find Capacity"
          subtitle="Describe what you need and review scored matches."
        />
      );
    case "/app/messages":
      return (
        <PageHeader
          icon={<MessageSquare className="h-5 w-5" />}
          title="Messages"
          subtitle="Private conversations with requesters and providers."
        />
      );
    case "/app/bookings":
      return (
        <PageHeader
          icon={<CalendarDays className="h-5 w-5" />}
          title="Bookings & Reviews"
          subtitle="Confirm, complete and review your exchanges."
        />
      );
    case "/app/resources":
      return (
        <PageHeader
          icon={<Boxes className="h-5 w-5" />}
          title="My Resources"
          subtitle="List the capacity you offer and its availability."
        />
      );
    case "/app/profile":
      return (
        <PageHeader
          icon={<UserIcon className="h-5 w-5" />}
          title="Profile"
          subtitle={`Account details and verification status for ${username}.`}
        />
      );
    default:
      return null;
  }
}

export default function AppShell() {
  const { user, logout, restoring, refreshing } = useAuth();
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
      <div className="flex min-h-screen items-center justify-center bg-ink-900 text-sm text-mist-400">
        Restoring session…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const initials = user.username.slice(0, 2).toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo to="/app" onClick={() => setMenuOpen(false)} />
      </div>

      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-brand-500/15 text-brand-300"
                  : "text-mist-400 hover:bg-white/[0.06] hover:text-mist-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <span className="flex items-center gap-2 text-xs font-bold text-mist-100">
          <LifeBuoy className="h-4 w-4 text-brand-400" /> Need a hand?
        </span>
        <p className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
          Walk through the whole flow in the How It Works guide.
        </p>
        <NavLink
          to="/how-it-works"
          className="mt-2.5 inline-block text-[11px] font-bold text-brand-400 transition-colors hover:text-brand-300"
        >
          Read the guide →
        </NavLink>
      </div>

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          void logout();
        }}
        className="m-3 mt-0 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-mist-400 transition-colors hover:bg-white/[0.06] hover:text-mist-100"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );

  const refreshingPill = refreshing && (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-[11px] font-bold text-brand-300"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
      <span className="hidden sm:inline">Refreshing your session…</span>
      <span className="sm:hidden">Refreshing…</span>
    </span>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-900">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-ink-950/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="dashboard-mobile-menu"
          className="rounded-xl border border-white/15 p-2 text-mist-100 transition-colors hover:bg-white/[0.08]"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Logo to="/app" size="sm" />
        <div className="ml-auto flex items-center gap-2.5">
          {refreshingPill}
          <NotificationsBell />
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Log out"
            className="rounded-xl border border-white/15 bg-white/[0.04] p-2 text-mist-200 transition-colors hover:bg-white/[0.09]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Off-canvas drawer (mobile) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="dashboard-mobile-menu"
        aria-label="Dashboard menu"
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] overflow-y-auto border-r border-white/10 bg-ink-950 transition-transform duration-200 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          className="absolute top-5 right-3 rounded-xl p-1.5 text-mist-400 transition-colors hover:bg-white/[0.08] hover:text-mist-100 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 hidden items-center gap-4 border-b border-white/10 bg-ink-900/80 px-6 py-3 backdrop-blur-xl lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mist-500" />
            <input
              className="w-full rounded-xl border border-white/10 bg-ink-850 py-2 pr-4 pl-10 text-sm text-mist-100 placeholder:text-mist-500 transition-colors hover:border-white/20 focus:border-brand-500/60 focus:bg-ink-800 focus:outline-none"
              placeholder="Search resources, locations, or requests…"
              aria-label="Search"
            />
          </div>
          <div className="ml-auto flex items-center gap-3.5">
            {refreshingPill}
            <NotificationsBell />
            <span className="flex items-center gap-2.5 border-l border-white/10 pl-3.5 text-sm font-semibold text-mist-200">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {initials}
              </span>
              <span className="max-w-32 truncate">{user.username}</span>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
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
  const { user } = useAuth();
  return <DashboardPanel username={user?.username} />;
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

  const rows: [string, string, boolean][] = [
    ["Phone", user.profile.phone || "—", false],
    ["Phone verified", user.profile.is_phone_verified ? "Yes" : "Not yet", user.profile.is_phone_verified],
    [
      "Identity verified",
      user.profile.is_identity_verified ? "Yes" : "Not yet",
      user.profile.is_identity_verified,
    ],
  ];

  return (
    <section className="max-w-lg rounded-2xl border border-white/10 bg-ink-800 p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-xl font-extrabold text-white">
          {user.username.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold text-mist-100">
            {user.first_name || user.last_name
              ? `${user.first_name} ${user.last_name}`.trim()
              : user.username}
          </h2>
          <p className="truncate text-sm text-mist-400">{user.email}</p>
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        {rows.map(([label, value, ok]) => (
          <div
            key={label}
            className="flex justify-between gap-4 border-t border-white/10 pt-3"
          >
            <dt className="text-mist-400">{label}</dt>
            <dd
              className={
                ok
                  ? "font-bold text-brand-400"
                  : "text-right font-semibold text-mist-200"
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
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-2.5 text-sm font-bold text-danger-400 transition-colors hover:bg-danger-500/20"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </section>
  );
}
