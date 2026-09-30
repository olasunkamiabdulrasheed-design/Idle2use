/** Stage 7: notification bell with unread badge + dropdown. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { friendlyError } from "../api/auth";
import type { Notification } from "../types/notifications";

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

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
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
        className="relative rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
            <span className="text-sm font-bold text-slate-900">
              Notifications
            </span>
            <button
              type="button"
              onClick={() => markAllNotificationsRead().then(refresh)}
              className="text-xs font-semibold text-green-700 hover:underline"
            >
              Mark all read
            </button>
          </div>
          {error && (
            <p className="px-4 py-2 text-xs text-red-700">{error}</p>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-4 text-sm text-slate-500">
                Nothing yet.
              </li>
            )}
            {items.slice(0, 15).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`block w-full border-b border-slate-50 px-4 py-2.5 text-left hover:bg-slate-50 ${
                    n.is_read ? "opacity-60" : ""
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-900">
                    {n.title}
                    {!n.is_read && (
                      <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-600 align-middle" />
                    )}
                  </span>
                  {n.body && (
                    <span className="block text-xs text-slate-600">
                      {n.body}
                    </span>
                  )}
                  <span className="block text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleString()}
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
