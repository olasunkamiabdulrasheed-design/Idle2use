/** Messages — conversations list, thread view, and starting a new chat. */

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageSquarePlus, Send } from "lucide-react";
import { friendlyError } from "../api/auth";
import {
  createConversation,
  listConversations,
  listMessages,
  listUsers,
  sendMessage,
} from "../api/messaging";
import type { Conversation, Message, UserOption } from "../types/messaging";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Input, Select } from "./ui/Field";

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

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Conversation list — hidden on mobile while a thread is open */}
        <Card
          padded={false}
          className={`p-4 ${activeId !== null ? "hidden lg:block" : ""}`}
        >
          <h2 className="flex items-center gap-2 text-sm font-bold text-mist-100">
            <MessageSquarePlus className="h-4 w-4 text-brand-400" />
            Conversations
          </h2>

          <form onSubmit={handleStart} className="mt-3 flex gap-2">
            <label htmlFor="new-chat" className="sr-only">
              Start a new chat
            </label>
            <Select
              id="new-chat"
              className="py-2 text-xs"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
            >
              <option value="">New chat with…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              size="sm"
              disabled={busy || !newUser}
              aria-label="Start conversation"
            >
              +
            </Button>
          </form>

          <ul className="mt-3 max-h-80 space-y-1.5 overflow-y-auto lg:max-h-[26rem]">
            {conversations.length === 0 && (
              <li className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-relaxed text-mist-500">
                No conversations yet. Start one with the selector above — you
                can message anyone you share a booking with.
              </li>
            )}
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    activeId === c.id
                      ? "border-brand-500/40 bg-brand-500/15"
                      : "border-white/10 bg-ink-850 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <span
                    className={`block font-semibold ${
                      activeId === c.id ? "text-brand-300" : "text-mist-100"
                    }`}
                  >
                    {otherNames(c)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-mist-400">
                    {c.last_message
                      ? `${c.last_message.sender}: ${c.last_message.body}`
                      : "No messages yet"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Thread */}
        <Card padded={false} className="flex h-[32rem] flex-col overflow-hidden">
          {activeId === null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-400">
                <MessageSquarePlus className="h-5 w-5" />
              </span>
              <p className="text-sm font-bold text-mist-100">
                No conversation selected
              </p>
              <p className="max-w-xs text-sm leading-relaxed text-mist-400">
                Nothing is open on the right. Choose a conversation from the
                list, or start a new one with the selector on the left.
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="rounded-lg p-1.5 text-mist-300 transition-colors hover:bg-white/[0.08] lg:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="min-w-0 truncate text-sm font-bold text-mist-100">
                  {activeConversation ? otherNames(activeConversation) : "Conversation"}
                </span>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className="px-8 py-8 text-center text-sm leading-relaxed text-mist-500">
                    No messages yet — say hello to get the conversation started.
                  </p>
                )}
                {messages.map((m) => {
                  const mine = m.sender_username === myUsername;
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                        mine
                          ? "ml-auto bg-brand-600 text-white"
                          : "border border-white/10 bg-ink-850 text-mist-100"
                      }`}
                    >
                      <span
                        className={`block text-[10px] font-bold ${
                          mine ? "text-white/75" : "text-mist-500"
                        }`}
                      >
                        {m.sender_username}
                      </span>
                      <span className="mt-0.5 block break-words">{m.body}</span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex gap-2 border-t border-white/10 p-3"
              >
                <label htmlFor="draft" className="sr-only">
                  Type a message
                </label>
                <Input
                  id="draft"
                  className="py-2"
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button type="submit" disabled={!draft.trim()} aria-label="Send">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
