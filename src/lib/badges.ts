import { LEAVE_TYPES } from "./constants";

type BadgeColor = "green" | "red" | "amber" | "blue" | "indigo" | "gray";

const STATUS_COLOR: Record<string, BadgeColor> = {
  Present: "green",
  Late: "amber",
  Leave: "blue",
  Absent: "red",
  "Half Day": "indigo",
  Approved: "green",
  Rejected: "red",
  Pending: "amber",
  Paid: "green",
  Active: "green",
  Inactive: "gray",
};

/** Returns the badge class string for a given status label. */
export function badgeClass(status: string): string {
  return `badge ${STATUS_COLOR[status] ?? "gray"}`;
}

/** Resolve a leave-type code (EL/SL/CL) to its display name. */
export function leaveTypeName(code: string): string {
  return LEAVE_TYPES.find((t) => t.code === code)?.name ?? code;
}
