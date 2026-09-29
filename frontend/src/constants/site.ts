/** Shared landing/about content constants (single source of truth). */

import {
  Boxes,
  Building2,
  Handshake,
  Lock,
  PenLine,
  ShieldCheck,
  Sparkles,
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
    desc: "Halls, classrooms, meeting rooms, event spaces",
  },
  {
    Icon: Boxes,
    name: "Storage",
    desc: "Warehouses, containers, secure storage",
  },
  {
    Icon: Truck,
    name: "Transportation",
    desc: "Vehicles, trucks, delivery capacity",
  },
  {
    Icon: Wrench,
    name: "Equipment",
    desc: "Tools, machinery, specialized equipment",
  },
];

export const STEPS: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: PenLine,
    title: "Describe what you need",
    desc: "Type it in plain English — our AI structures your request.",
  },
  {
    Icon: Sparkles,
    title: "Get matched instantly",
    desc: "The matching engine scores available capacity against your needs.",
  },
  {
    Icon: Handshake,
    title: "Book & collaborate",
    desc: "Confirm bookings, message providers, and leave reviews.",
  },
];

export const TRUST: {
  Icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    Icon: ShieldCheck,
    title: "Verified profiles",
    desc: "Phone and identity verification flags on every account.",
  },
  {
    Icon: Star,
    title: "Real reviews",
    desc: "Ratings only after completed bookings — no fake trust.",
  },
  {
    Icon: Lock,
    title: "Backend-owned rules",
    desc: "Access, ownership and conflicts enforced by the API.",
  },
];
