/** Notification bell with unread badge + dropdown panel. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { friendlyError } from "../api/auth";
import type { Notification } from "../types/notifications";
import Badge from "./ui/Badge";

export default function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      setItems(await listNotifications());
      setError("");
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 30000);
    return () => window.clearInterval(id);
  }, [refresh]);

  // Close on outside click and on Escape.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const unread = items.filter((n) => !n.is_read).length;

  async function handleClick(n: Notification) {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id);
      } catch (err: unknown) {
        setError(friendlyError(err));
      }
    }
    refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl border border-white/15 bg-white/[0.04] p-2 text-mist-200 transition-colors hover:bg-white/[0.09] hover:text-mist-100"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white ring-2 ring-ink-900">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl shadow-ink-950/60">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-bold text-mist-100">
              Notifications
              {unread > 0 && <Badge tone="brand">{unread} new</Badge>}
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead().then(refresh)}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 transition-colors hover:text-brand-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {error && <p className="px-4 py-2 text-xs text-danger-400">{error}</p>}

          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-sm leading-relaxed text-mist-500">
                Nothing yet. New matches, messages and booking updates will
                appear here as they happen.
              </li>
            )}
            {items.slice(0, 15).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`flex w-full gap-2.5 border-b border-white/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.05] ${
                    n.is_read ? "opacity-55" : ""
                  }`}
                >
                  {!n.is_read && (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500"
                    />
                  )}
                  <span className={n.is_read ? "min-w-0" : "min-w-0 pl-0"}>
                    <span className="block text-sm font-semibold text-mist-100">
                      {n.title}
                    </span>
                    {n.body && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-mist-400">
                        {n.body}
                      </span>
                    )}
                    <span className="mt-1 block text-[10px] text-mist-500">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
