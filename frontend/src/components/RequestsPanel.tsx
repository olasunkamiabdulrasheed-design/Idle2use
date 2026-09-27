import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatApiError } from "../api/auth";
import { createRequest, deleteRequest, listRequests, updateRequest } from "../api/requests";
import type { CapacityRequest, RequestCategory, RequestStatus } from "../types/requests";

const inputClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";

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

const statusBadge: Record<RequestStatus, string> = {
  active: "bg-blue-100 text-blue-800",
  matched: "bg-green-100 text-green-800",
  fulfilled: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-800",
};

export default function RequestsPanel() {
  const [requests, setRequests] = useState<CapacityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  async function load(status = "") {
    setLoading(true);
    setError("");
    try {
      const data = await listRequests(status ? { status } : {});
      setRequests(data);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
    } catch (err: unknown) {
      setError(formatApiError(err));
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
      setError(formatApiError(err));
    }
  }

  async function handleDelete(r: CapacityRequest) {
    setError("");
    try {
      await deleteRequest(r.id);
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
      setNotice(`Request #${r.id} deleted.`);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
        Stage 4 · Capacity Requests
      </p>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">I NEED CAPACITY</h2>
      <p className="mt-1 text-sm text-slate-600">
        Say what you need. Requests stay active while we search.
      </p>
      {notice && <p className="mt-2 text-sm text-green-700">{notice}</p>}
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 p-3 font-mono text-sm break-all text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <select
          aria-label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as RequestCategory })}
          className={inputClass}
        >
          <option value="transportation">Transportation</option>
          <option value="storage">Storage</option>
          <option value="space">Space</option>
          <option value="equipment">Equipment</option>
        </select>
        <input
          aria-label="Resource type"
          value={form.resource_type}
          onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
          placeholder="resource type (classroom, hall…)"
          className={inputClass}
        />
        <input
          aria-label="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="location * (Ikeja, Lagos)"
          required
          className={inputClass}
        />
        <input
          aria-label="Capacity required"
          value={form.capacity_required}
          onChange={(e) => setForm({ ...form, capacity_required: e.target.value })}
          placeholder="capacity required *"
          type="number"
          min={1}
          required
          className={inputClass}
        />
        <input
          aria-label="Date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          type="date"
          required
          className={inputClass}
        />
        <div className="flex gap-2">
          <input
            aria-label="Start time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            type="time"
            required
            className={`${inputClass} flex-1`}
          />
          <input
            aria-label="End time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            type="time"
            required
            className={`${inputClass} flex-1`}
          />
        </div>
        <input
          aria-label="Purpose"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          placeholder="purpose (birthday event, meeting…)"
          className={`${inputClass} md:col-span-2`}
        />
        <input
          aria-label="Requirements"
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          placeholder="requirements (must have projector…)"
          className={`${inputClass} md:col-span-2`}
        />
        <textarea
          aria-label="Describe your need in your own words"
          value={form.original_text}
          onChange={(e) => setForm({ ...form, original_text: e.target.value })}
          placeholder="In your own words: “I need a classroom for 20 people in Ikeja tomorrow from 10am to 4pm…”"
          rows={2}
          className={`${inputClass} md:col-span-2`}
        />
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "POST /api/requests/"}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label htmlFor="req-status" className="text-xs font-bold text-slate-600 uppercase">
          My requests
        </label>
        <select
          id="req-status"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            void load(e.target.value);
          }}
          className={inputClass}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="matched">Matched</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="mt-3 space-y-3">
        {loading && <p className="text-sm text-slate-600">Loading your requests…</p>}
        {!loading && requests.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No requests yet. Tell us what capacity you need and we'll start searching.
          </p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900">#{r.id}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[r.status]}`}>
                {r.status}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {r.category}
                {r.resource_type ? ` · ${r.resource_type}` : ""}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-800">
              {r.capacity_required} needed · {r.location} · {r.date} {r.start_time}–{r.end_time}
            </p>
            {r.purpose && <p className="text-xs text-slate-500">Purpose: {r.purpose}</p>}
            {r.requirements && (
              <p className="text-xs text-slate-500">Requirements: {r.requirements}</p>
            )}
            {r.original_text && (
              <p className="mt-1 font-mono text-xs break-all text-slate-500 italic">
                “{r.original_text}”
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {r.status === "active" && (
                <button
                  type="button"
                  onClick={() => void handleCancel(r)}
                  className="rounded-lg bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900"
                >
                  Cancel request
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleDelete(r)}
                className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
