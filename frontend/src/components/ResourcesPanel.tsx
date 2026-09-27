import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createAvailability,
  createResource,
  deleteAvailability,
  deleteResource,
  listAvailability,
  listResources,
  updateAvailability,
  updateResource,
} from "../api/resources";
import { formatApiError } from "../api/auth";
import type {
  Availability,
  Resource,
  ResourceCategory,
  ResourceStatus,
} from "../types/resources";

const inputClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none";

const emptyForm = {
  category: "space" as ResourceCategory,
  name: "",
  description: "",
  location: "",
  capacity: "40",
  capacity_unit: "people",
};

export default function ResourcesPanel() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const [openId, setOpenId] = useState<number | null>(null);
  const [slots, setSlots] = useState<Record<number, Availability[]>>({});
  const [slotDate, setSlotDate] = useState("2026-10-05");
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("14:00");
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);

  async function load(filters = { category: "", location: "", status: "" }) {
    setLoading(true);
    setError("");
    try {
      const data = await listResources({
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.location ? { location: filters.location } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      });
      setResources(data);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function applyFilters(e: FormEvent) {
    e.preventDefault();
    void load({ category: filterCategory, location: filterLocation, status: filterStatus });
  }

  function startEdit(r: Resource) {
    setEditingId(r.id);
    setForm({
      category: r.category,
      name: r.name,
      description: r.description,
      location: r.location,
      capacity: String(r.capacity),
      capacity_unit: r.capacity_unit,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const payload = {
        category: form.category,
        name: form.name.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        capacity: Number(form.capacity),
        capacity_unit: form.capacity_unit.trim() || "units",
      };
      if (editingId === null) {
        const created = await createResource(payload);
        setNotice(`Created resource #${created.id} (${created.name}).`);
      } else {
        await updateResource(editingId, payload);
        setNotice(`Updated resource #${editingId}.`);
      }
      cancelEdit();
      await load({ category: filterCategory, location: filterLocation, status: filterStatus });
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setError("");
    try {
      await deleteResource(id);
      setNotice(`Deleted resource #${id}. DELETE means it no longer exists.`);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  async function toggleStatus(r: Resource) {
    setError("");
    const next: ResourceStatus = r.status === "active" ? "inactive" : "active";
    try {
      await updateResource(r.id, { status: next });
      setNotice(
        next === "inactive"
          ? `Resource #${r.id} deactivated — kept, but excluded from matching.`
          : `Resource #${r.id} reactivated.`,
      );
      setResources((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  async function loadSlots(resourceId: number) {
    setError("");
    try {
      const data = await listAvailability(resourceId);
      setSlots((prev) => ({ ...prev, [resourceId]: data }));
      setOpenId(resourceId);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  async function handleAddOrUpdateSlot(e: FormEvent, resourceId: number) {
    e.preventDefault();
    setError("");
    try {
      if (editingSlotId === null) {
        await createAvailability(resourceId, {
          date: slotDate,
          start_time: slotStart,
          end_time: slotEnd,
        });
        setNotice(`Availability added to resource #${resourceId}.`);
      } else {
        await updateAvailability(editingSlotId, {
          date: slotDate,
          start_time: slotStart,
          end_time: slotEnd,
        });
        setNotice(`Availability #${editingSlotId} updated.`);
        setEditingSlotId(null);
      }
      await loadSlots(resourceId);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  async function handleDeleteSlot(resourceId: number, slotId: number) {
    setError("");
    try {
      await deleteAvailability(slotId);
      setNotice(`Availability #${slotId} deleted.`);
      await loadSlots(resourceId);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
        Stage 3 · My Resources
      </p>
      <h2 className="mt-1 text-2xl font-bold text-slate-900">I HAVE CAPACITY</h2>
      {notice && <p className="mt-2 text-sm text-green-700">{notice}</p>}
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 p-3 font-mono text-sm break-all text-red-700">
          {error}
        </p>
      )}

      {/* Filters (basic browsing; matching engine comes later). */}
      <form onSubmit={applyFilters} className="mt-4 flex flex-wrap gap-2">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={inputClass}>
          <option value="">All categories</option>
          <option value="transportation">Transportation</option>
          <option value="storage">Storage</option>
          <option value="space">Space</option>
          <option value="equipment">Equipment</option>
        </select>
        <input value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} placeholder="location contains…" className={inputClass} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          GET /api/resources/
        </button>
      </form>

      {/* Create / edit form. */}
      <form onSubmit={handleSubmit} className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ResourceCategory })} className={inputClass}>
          <option value="transportation">Transportation</option>
          <option value="storage">Storage</option>
          <option value="space">Space</option>
          <option value="equipment">Equipment</option>
        </select>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="name *" required className={inputClass} />
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="location * (e.g. Ikeja, Lagos)" required className={inputClass} />
        <input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="capacity *" type="number" min={1} required className={inputClass} />
        <input value={form.capacity_unit} onChange={(e) => setForm({ ...form, capacity_unit: e.target.value })} placeholder="capacity_unit (people, boxes…)" className={inputClass} />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="description" className={`${inputClass} md:col-span-2`} />
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={busy} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "Saving…" : editingId === null ? "POST /api/resources/" : `PATCH /api/resources/${editingId}/`}
          </button>
          {editingId !== null && (
            <button type="button" onClick={cancelEdit} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Resource list. */}
      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-slate-600">Loading resources…</p>}
        {!loading && resources.length === 0 && (
          <p className="text-sm text-slate-600">No resources yet. Create your first one above.</p>
        )}
        {resources.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900">#{r.id} {r.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{r.category}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>
                {r.status}
              </span>
              <span className="text-xs text-slate-500">
                {r.capacity} {r.capacity_unit} · {r.location} · by {r.owner_username}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => startEdit(r)} className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-900">Edit</button>
              <button type="button" onClick={() => void toggleStatus(r)} className="rounded-lg bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">
                {r.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button type="button" onClick={() => void handleDelete(r.id)} className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">Delete</button>
              <button type="button" onClick={() => void loadSlots(r.id)} className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {openId === r.id ? "Reload availability" : "Availability"}
              </button>
            </div>

            {openId === r.id && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700 uppercase">Availability</p>
                <ul className="mt-1 space-y-1">
                  {(slots[r.id] ?? []).map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-800">
                      <span>#{s.id} {s.date} {s.start_time}–{s.end_time} [{s.status}]</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlotId(s.id);
                          setSlotDate(s.date);
                          setSlotStart(s.start_time.slice(0, 5));
                          setSlotEnd(s.end_time.slice(0, 5));
                        }}
                        className="rounded bg-slate-200 px-2 py-0.5 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteSlot(r.id, s.id)}
                        className="rounded bg-red-100 px-2 py-0.5 font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                  {(slots[r.id] ?? []).length === 0 && (
                    <li className="text-xs text-slate-500">No availability yet.</li>
                  )}
                </ul>
                <form onSubmit={(e) => void handleAddOrUpdateSlot(e, r.id)} className="mt-2 flex flex-wrap gap-2">
                  <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required className={inputClass} />
                  <input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} required className={inputClass} />
                  <input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} required className={inputClass} />
                  <button type="submit" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white">
                    {editingSlotId === null ? "Add slot" : `Save #${editingSlotId}`}
                  </button>
                  {editingSlotId !== null && (
                    <button type="button" onClick={() => setEditingSlotId(null)} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold">
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
