export type Role = "admin" | "employee";

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Half Day"
  | "Leave"
  | "Absent";

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export type PayslipStatus = "Paid" | "Pending";

export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Intern";

export type EmployeeStatus = "Active" | "Inactive";

export interface LeaveTypeDef {
  code: string;
  name: string;
  total: number;
}

export interface SalaryBreakdown {
  gross: number;
  basic: number;
  hra: number;
  special: number;
  pf: number;
  tax: number;
  deductions: number;
  net: number;
}
