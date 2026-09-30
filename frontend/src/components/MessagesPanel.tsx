/** Stage 8: conversations list + thread + new conversation. */

import { useCallback, useEffect, useRef, useState } from "react";
import { friendlyError } from "../api/auth";
import {
  createConversation,
  listConversations,
  listMessages,
  listUsers,
  sendMessage,
} from "../api/messaging";
import type { Conversation, Message, UserOption } from "../types/messaging";

export default function MessagesPanel({ myUsername }: { myUsername: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [newUser, setNewUser] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const [convs, opts] = await Promise.all([
        listConversations(),
        listUsers(),
      ]);
      setConversations(convs);
      setUsers(opts);
      setError("");
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (activeId === null) return;
    listMessages(activeId)
      .then(setMessages)
      .catch((err: unknown) => setError(friendlyError(err)));
    // Mark-read happens server-side on GET.
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function otherNames(c: Conversation): string {
    return c.participant_names.filter((n) => n !== myUsername).join(", ") ||
      c.participant_names.join(", ");
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser) return;
    setBusy(true);
    try {
      const conv = await createConversation(Number(newUser));
      setActiveId(conv.id);
      setNewUser("");
      await refresh();
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (activeId === null || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    try {
      const msg = await sendMessage(activeId, body);
      setMessages((prev) => [...prev, msg]);
      await refresh();
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Messages
      </p>
      <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-[260px_1fr]">
        {/* Conversation list — hidden on mobile while a thread is open */}
        <div className={`space-y-3 ${activeId !== null ? "hidden md:block" : ""}`}>
          <form onSubmit={handleStart} className="flex gap-2">
            <select
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
            >
              <option value="">New chat with…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy || !newUser}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              +
            </button>
          </form>

          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {conversations.length === 0 && (
              <li className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                No conversations yet.
              </li>
            )}
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    activeId === c.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="block font-semibold">{otherNames(c)}</span>
                  <span className="block truncate text-xs opacity-75">
                    {c.last_message
                      ? `${c.last_message.sender}: ${c.last_message.body}`
                      : "No messages yet"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex h-96 flex-col rounded-xl border border-slate-200 md:h-80">
          {activeId === null ? (
            <div className="flex flex-1 items-center justify-center p-4 text-sm text-slate-500">
              Select or start a conversation.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="m-2 mb-0 w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 md:hidden"
              >
                ← Back to conversations
              </button>
              <div className="mt-2 flex-1 space-y-2 overflow-y-auto p-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      m.sender_username === myUsername
                        ? "ml-auto bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <span className="block text-[10px] font-semibold opacity-70">
                      {m.sender_username}
                    </span>
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form
                onSubmit={handleSend}
                className="flex gap-2 border-t border-slate-200 p-2"
              >
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
