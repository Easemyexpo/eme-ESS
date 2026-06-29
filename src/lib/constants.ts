import type { LeaveTypeDef } from "@/types";

export const APP_NAME = "EME People";
export const COMPANY_NAME = "EaseMyExpo";

export const LEAVE_TYPES: LeaveTypeDef[] = [
  { code: "EL", name: "Earned Leave", total: 12 },
  { code: "SL", name: "Sick Leave", total: 8 },
];

export const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
] as const;

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"] as const;

/**
 * After this hour a same-day check-in is recorded as "Late" rather than
 * "Present". Mirrors the prototype business rule (>= 10:00).
 */
export const LATE_THRESHOLD_HOUR = 10;
