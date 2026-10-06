/** Find Capacity — natural-language request composer, structured fallback
 * form, request list, and per-request scored matches. */

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Check, Search, Sparkles } from "lucide-react";
import { friendlyError } from "../api/auth";
import { createBooking } from "../api/bookings";
import {
  createRequest,
  deleteRequest,
  listRequests,
  parseRequestText,
  runMatching,
  updateRequest,
} from "../api/requests";
import type { CapacityRequest, RequestCategory, RequestStatus } from "../types/requests";
import type { Match } from "../types/matches";
import Alert from "./ui/Alert";
import Badge, { statusTone } from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Field, Input, Select, Textarea } from "./ui/Field";

const emptyForm = {
  category: "space" as RequestCategory,
  resource_type: "",
  location: "",
  capacity_required: "20",
  date: "2026-10-06",
  start_time: "10:00",
  end_time: "16:00",
  purpose: "",
  requirements: "",
  original_text: "",
};

const CATEGORY_LABEL: Record<string, string> = {
  space: "Space",
  storage: "Storage",
  transportation: "Transportation",
  equipment: "Equipment",
};

export default function RequestsPanel() {
  const [requests, setRequests] = useState<CapacityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  // Natural-language understanding.
  const [nlText, setNlText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [understood, setUnderstood] = useState(false);
  const [parserSource, setParserSource] = useState<string>("");

  // Match results per request id.
  const [matches, setMatches] = useState<Record<number, Match[]>>({});
  const [matchingId, setMatchingId] = useState<number | null>(null);

  // Booking directly from a match card.
  const [bookingMatch, setBookingMatch] = useState<number | null>(null);

  async function handleBook(m: Match) {
    setError("");
    setBookingMatch(m.id);
    try {
      const booking = await createBooking({
        request: m.request,
        resource: m.resource,
      });
      setNotice(
        `Booking #${booking.id} requested with ${m.resource_detail.name} — check Bookings for status.`,
      );
      setMatches((prev) => ({
        ...prev,
        [m.request]: (prev[m.request] ?? []).filter((x) => x.id !== m.id),
      }));
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setBookingMatch(null);
    }
  }

  async function handleFindMatches(requestId: number) {
    setError("");
    setMatchingId(requestId);
    try {
      const res = await runMatching(requestId);
      setMatches((prev) => ({ ...prev, [requestId]: res }));
      setNotice(
        res.length
          ? `Found ${res.length} match${res.length === 1 ? "" : "es"}.`
          : "No strong matches right now. Your request stays active — we'll check again when new capacity appears.",
      );
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setMatchingId(null);
    }
  }

  async function load(status = "") {
    setLoading(true);
    setError("");
    try {
      const data = await listRequests(status ? { status } : {});
      setRequests(data);
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleParse(e: FormEvent) {
    e.preventDefault();
    setError("");
    setParseWarnings([]);
    setUnderstood(false);
    setParsing(true);
    try {
      const res = await parseRequestText(nlText.trim());
      const s = res.suggestion;
      setForm((prev) => ({
        ...prev,
        category: (s.category as RequestCategory) ?? prev.category,
        resource_type: s.resource_type ?? prev.resource_type,
        location: s.location ?? prev.location,
        capacity_required:
          s.capacity_required != null ? String(s.capacity_required) : prev.capacity_required,
        date: s.date ?? prev.date,
        start_time: s.start_time ?? prev.start_time,
        end_time: s.end_time ?? prev.end_time,
        purpose: s.purpose ?? prev.purpose,
        requirements: s.requirements ?? prev.requirements,
        original_text: res.original_text,
      }));
      setParseWarnings(res.warnings);
      setParserSource(res.parser === "ai" ? "AI" : "rule-based");
      setUnderstood(true);
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const created = await createRequest({
        category: form.category,
        resource_type: form.resource_type.trim(),
        location: form.location.trim(),
        capacity_required: Number(form.capacity_required),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        purpose: form.purpose.trim(),
        requirements: form.requirements.trim(),
        original_text: form.original_text.trim(),
      });
      setNotice(
        `Request #${created.id} created. It stays active until matched, cancelled, or expired.`,
      );
      setForm(emptyForm);
      await load(filterStatus);
      await handleFindMatches(created.id);
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(r: CapacityRequest) {
    setError("");
    try {
      const updated = await updateRequest(r.id, { status: "cancelled" });
      setRequests((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
      setNotice(`Request #${r.id} cancelled.`);
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }

  async function handleDelete(r: CapacityRequest) {
    setError("");
    try {
      await deleteRequest(r.id);
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
      setNotice(`Request #${r.id} deleted.`);
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }

  return (
    <div className="space-y-5">
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      {/* Natural-language composer — the primary path. */}
      <Card tone="brand" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-mist-100">
              What capacity do you need?
            </h2>
            <Badge tone="brand">
              <Sparkles className="h-3 w-3" /> Plain English
            </Badge>
          </div>
          <p className="mt-1 text-sm text-mist-400">
            Describe it in your own words — we'll structure it into a request.
          </p>

          <form onSubmit={handleParse} className="mt-4">
            <label htmlFor="nl-input" className="sr-only">
              Describe the capacity you need
            </label>
            <Textarea
              id="nl-input"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              placeholder="I need a classroom for 20 people in Ikeja tomorrow from 10am to 4pm…"
              rows={3}
              required
            />
            <Button type="submit" disabled={parsing} className="mt-3">
              <Search className="h-4 w-4" />
              {parsing ? "Understanding your request…" : "Find capacity"}
            </Button>
          </form>

          {understood && (
            <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/60 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-brand-300">
                <Check className="h-4 w-4" />
                Understood — review and confirm below
                <Badge tone="muted">{parserSource} parser</Badge>
              </p>
              {parseWarnings.map((w) => (
                <p key={w} className="mt-1.5 text-xs text-warn-300">
                  ⚠ {w}
                </p>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Structured form — pre-filled by the parser, editable by hand. */}
      <Card>
        <h2 className="text-base font-bold text-mist-100">Request details</h2>
        <p className="mt-1 text-sm text-mist-400">
          Adjust anything the parser got wrong, then search.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as RequestCategory })
              }
            >
              <option value="transportation">Transportation</option>
              <option value="storage">Storage</option>
              <option value="space">Space</option>
              <option value="equipment">Equipment</option>
            </Select>
          </Field>

          <Field label="Resource type">
            <Input
              value={form.resource_type}
              onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
              placeholder="classroom, hall…"
            />
          </Field>

          <Field label="Location" hint="Required — matching scores location first.">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ikeja, Lagos"
              required
            />
          </Field>

          <Field label="Capacity required">
            <Input
              value={form.capacity_required}
              onChange={(e) =>
                setForm({ ...form, capacity_required: e.target.value })
              }
              type="number"
              min={1}
              required
            />
          </Field>

          <Field label="Date">
            <Input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              type="date"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <Input
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                type="time"
                required
              />
            </Field>
            <Field label="To">
              <Input
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                type="time"
                required
              />
            </Field>
          </div>

          <Field label="Purpose" className="sm:col-span-2">
            <Input
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="Birthday event, team meeting…"
            />
          </Field>

          <Field label="Requirements" className="sm:col-span-2">
            <Input
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              placeholder="Must have a projector, parking…"
            />
          </Field>

          <Field
            label="Your own words"
            className="sm:col-span-2"
            hint="Kept alongside the structured fields for reference."
          >
            <Textarea
              value={form.original_text}
              onChange={(e) => setForm({ ...form, original_text: e.target.value })}
              placeholder="I need a classroom for 20 people in Ikeja tomorrow from 10am to 4pm…"
              rows={2}
            />
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} size="lg">
              <Search className="h-4 w-4" />
              {busy ? "Creating…" : "Find matching capacity"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Request list */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-mist-100">My requests</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="req-status" className="sr-only">
              Filter by status
            </label>
            <Select
              id="req-status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                void load(e.target.value);
              }}
              className="w-auto py-2 text-xs"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="matched">Matched</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </Select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-mist-400">Loading your requests…</p>}

          {!loading && requests.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm leading-relaxed text-mist-400">
              You have not posted anything yet. Describe what you need in the
              box above and matching will start looking through available
              capacity straight away.
            </p>
          )}

          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-ink-850 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-mist-100">#{r.id}</span>
                <Badge tone={statusTone(r.status)} className="capitalize">
                  {r.status}
                </Badge>
                <Badge tone="muted">
                  {CATEGORY_LABEL[r.category] ?? r.category}
                  {r.resource_type ? ` · ${r.resource_type}` : ""}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-mist-200">
                {r.capacity_required} needed · {r.location} · {r.date}{" "}
                {r.start_time}–{r.end_time}
              </p>
              {r.purpose && (
                <p className="mt-0.5 text-xs text-mist-400">
                  Purpose: {r.purpose}
                </p>
              )}
              {r.requirements && (
                <p className="mt-0.5 text-xs text-mist-400">
                  Requirements: {r.requirements}
                </p>
              )}
              {r.original_text && (
                <p className="mt-2 border-l-2 border-white/10 pl-3 text-xs text-mist-500 italic">
                  "{r.original_text}"
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "active" && (
                  <Button
                    size="sm"
                    onClick={() => void handleFindMatches(r.id)}
                    disabled={matchingId === r.id}
                  >
                    {matchingId === r.id ? "Searching…" : "Find matches"}
                  </Button>
                )}
                {r.status === "active" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleCancel(r)}
                  >
                    Cancel request
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => void handleDelete(r)}
                >
                  Delete
                </Button>
              </div>

              {/* Match results */}
              {matches[r.id] && (
                <div className="mt-4 space-y-2.5">
                  {matches[r.id].length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/15 p-3.5 text-sm leading-relaxed text-mist-400">
                      <strong className="text-mist-200">
                        No strong matches right now.
                      </strong>{" "}
                      Nothing currently listed fits this request well enough to
                      score. It stays active, and matching re-runs whenever a
                      provider frees up capacity.
                    </p>
                  )}

                  {matches[r.id].map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-brand-500/25 bg-brand-500/[0.07] p-3.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{m.score}% match</Badge>
                        <span className="font-bold text-mist-100">
                          {m.resource_detail.name}
                        </span>
                        <span className="text-xs text-mist-400">
                          {m.resource_detail.location}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-mist-300">
                        Capacity {m.resource_detail.capacity}{" "}
                        {m.resource_detail.capacity_unit} ·{" "}
                        {m.resource_detail.category} · by{" "}
                        {m.resource_detail.owner_username}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {m.reasons.map((reason) => (
                          <li
                            key={reason}
                            className="flex items-start gap-1.5 text-xs text-mist-300"
                          >
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="sm"
                        onClick={() => void handleBook(m)}
                        disabled={bookingMatch === m.id}
                        className="mt-3"
                      >
                        {bookingMatch === m.id ? "Booking…" : "Book this capacity"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
