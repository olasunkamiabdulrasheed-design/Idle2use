/** My Resources — publish capacity, manage availability windows, and browse
 * what you have listed. */

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Boxes, CalendarPlus, Pencil, Plus, Trash2 } from "lucide-react";
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
import { friendlyError } from "../api/auth";
import type {
  Availability,
  Resource,
  ResourceCategory,
  ResourceStatus,
} from "../types/resources";
import Alert from "./ui/Alert";
import Badge, { statusTone } from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Field, Input, Select } from "./ui/Field";

const emptyForm = {
  category: "space" as ResourceCategory,
  name: "",
  description: "",
  location: "",
  capacity: "40",
  capacity_unit: "people",
};

const CATEGORY_OPTIONS = [
  ["space", "Space"],
  ["storage", "Storage"],
  ["transportation", "Transportation"],
  ["equipment", "Equipment"],
] as const;

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
      setError(friendlyError(err));
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
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setError("");
    try {
      await deleteResource(id);
      setNotice("Resource deleted.");
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      setError(friendlyError(err));
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
      setError(friendlyError(err));
    }
  }

  async function loadSlots(resourceId: number) {
    setError("");
    try {
      const data = await listAvailability(resourceId);
      setSlots((prev) => ({ ...prev, [resourceId]: data }));
      setOpenId(resourceId);
    } catch (err: unknown) {
      setError(friendlyError(err));
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
      setError(friendlyError(err));
    }
  }

  async function handleDeleteSlot(resourceId: number, slotId: number) {
    setError("");
    try {
      await deleteAvailability(slotId);
      setNotice(`Availability #${slotId} deleted.`);
      await loadSlots(resourceId);
    } catch (err: unknown) {
      setError(friendlyError(err));
    }
  }

  return (
    <div className="space-y-5">
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      {/* Publish / edit */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold text-mist-100">
            {editingId === null ? "Publish a resource" : `Edit resource #${editingId}`}
          </h2>
          {editingId === null && (
            <Badge tone="brand">
              <Plus className="h-3 w-3" /> New listing
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-mist-400">
          List what you have and matching will surface it to the right requests.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as ResourceCategory })
              }
            >
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Resource name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Community hall, 10ft van…"
              required
            />
          </Field>

          <Field label="Location">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ikeja, Lagos"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacity">
              <Input
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                type="number"
                min={1}
                required
              />
            </Field>
            <Field label="Unit">
              <Input
                value={form.capacity_unit}
                onChange={(e) => setForm({ ...form, capacity_unit: e.target.value })}
                placeholder="people"
              />
            </Field>
          </div>

          <Field label="Description" className="sm:col-span-2">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What makes this useful? Parking, projector, loading bay…"
            />
          </Field>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" disabled={busy} size="lg">
              {busy
                ? "Saving…"
                : editingId === null
                  ? "Publish resource"
                  : "Save changes"}
            </Button>
            {editingId !== null && (
              <Button type="button" variant="secondary" size="lg" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Filters */}
      <Card>
        <form onSubmit={applyFilters} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <Field label="Category">
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Location">
            <Input
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="Filter by location…"
            />
          </Field>
          <Field label="Status">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
          <Button type="submit" variant="secondary" size="lg">
            Apply filters
          </Button>
        </form>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {loading && <p className="text-sm text-mist-400">Loading resources…</p>}

        {!loading && resources.length === 0 && (
          <Card tone="outline" className="border-dashed text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-400">
              <Boxes className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-bold text-mist-100">
              No resources yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-mist-400">
              You have not listed anything yet. Publish your first resource
              above — give it a category, a location and the hours it is free,
              and matching will start bringing requests to you.
            </p>
          </Card>
        )}

        {resources.map((r) => (
          <Card key={r.id} padded={false} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-mist-100">
                #{r.id} {r.name}
              </span>
              <Badge tone="muted" className="capitalize">
                {r.category}
              </Badge>
              <Badge tone={statusTone(r.status)} className="capitalize">
                {r.status}
              </Badge>
            </div>

            <p className="mt-2 text-xs text-mist-400">
              {r.capacity} {r.capacity_unit} · {r.location} · by {r.owner_username}
            </p>
            {r.description && (
              <p className="mt-1.5 text-sm text-mist-300">{r.description}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => startEdit(r)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void toggleStatus(r)}>
                {r.status === "active" ? "Deactivate" : "Activate"}
              </Button>
              <Button size="sm" onClick={() => void loadSlots(r.id)}>
                <CalendarPlus className="h-3.5 w-3.5" />
                {openId === r.id ? "Reload availability" : "Availability"}
              </Button>
              <Button size="sm" variant="danger" onClick={() => void handleDelete(r.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>

            {openId === r.id && (
              <div className="mt-4 rounded-xl border border-white/10 bg-ink-850 p-4">
                <p className="text-xs font-bold tracking-wide text-mist-400 uppercase">
                  Availability windows
                </p>
                <ul className="mt-2 space-y-1.5">
                  {(slots[r.id] ?? []).map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center gap-2 text-xs text-mist-200"
                    >
                      <span className="font-semibold">
                        {s.date} · {s.start_time}–{s.end_time}
                      </span>
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlotId(s.id);
                          setSlotDate(s.date);
                          setSlotStart(s.start_time.slice(0, 5));
                          setSlotEnd(s.end_time.slice(0, 5));
                        }}
                        className="rounded-lg border border-white/15 px-2 py-0.5 font-semibold text-mist-300 transition-colors hover:bg-white/[0.08]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteSlot(r.id, s.id)}
                        className="rounded-lg border border-danger-500/30 px-2 py-0.5 font-semibold text-danger-400 transition-colors hover:bg-danger-500/15"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                  {(slots[r.id] ?? []).length === 0 && (
                    <li className="text-xs leading-relaxed text-mist-500">
                      No availability set. Add a window below, otherwise
                      matching has no free hours to offer and this resource will
                      never be suggested.
                    </li>
                  )}
                </ul>

                <form
                  onSubmit={(e) => void handleAddOrUpdateSlot(e, r.id)}
                  className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
                >
                  <Field label="Date">
                    <Input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="From">
                    <Input
                      type="time"
                      value={slotStart}
                      onChange={(e) => setSlotStart(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="To">
                    <Input
                      type="time"
                      value={slotEnd}
                      onChange={(e) => setSlotEnd(e.target.value)}
                      required
                    />
                  </Field>
                  <Button type="submit">
                    {editingSlotId === null ? "Add window" : `Save #${editingSlotId}`}
                  </Button>
                </form>

                {editingSlotId !== null && (
                  <button
                    type="button"
                    onClick={() => setEditingSlotId(null)}
                    className="mt-2 text-xs font-bold text-mist-400 transition-colors hover:text-mist-200"
                  >
                    Cancel editing window
                  </button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
