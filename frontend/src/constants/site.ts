/** Shared marketing copy (single source of truth for categories and trust).
 * Written to read as real product copy rather than labels: each entry says
 * what the thing is AND why someone would care about it. */

import {
  Boxes,
  Building2,
  Lock,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CATEGORIES: {
  Icon: LucideIcon;
  name: string;
  desc: string;
}[] = [
  {
    Icon: Building2,
    name: "Spaces & Venues",
    desc: "Halls, classrooms, meeting rooms and event venues that sit empty between bookings. Perfect for workshops, rehearsals, trainings and one-off gatherings.",
  },
  {
    Icon: Boxes,
    name: "Storage",
    desc: "Warehouses, containers, spare rooms and secure yards with room to spare. Keep stock, equipment or seasonal inventory safe for exactly as long as you need it.",
  },
  {
    Icon: Truck,
    name: "Transportation",
    desc: "Vans, trucks, buses and drivers with hours left in the week. Move goods, people or deliveries without buying and maintaining a fleet of your own.",
  },
  {
    Icon: Wrench,
    name: "Equipment",
    desc: "Tools, machinery, cameras, sound systems and specialist kit that spends most of the year in a cupboard. Earn from it while it is idle, or borrow what you need.",
  },
];

export const TRUST: {
  Icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    Icon: ShieldCheck,
    title: "Profiles you can check",
    desc: "Every account carries contact details and verification status flags, so you can see exactly who you are dealing with before you commit to anything.",
  },
  {
    Icon: Star,
    title: "Reviews that mean something",
    desc: "Ratings can only be left by the two parties on a completed booking. No completed exchange, no review — which is what keeps the feedback honest.",
  },
  {
    Icon: Lock,
    title: "Rules the API enforces",
    desc: "Access, ownership and booking conflicts are checked server-side on every single request, so they hold no matter which screen you are looking at.",
  },
];
