import type {
  AttendanceStatus,
  EmployeeStatus,
  EmploymentType,
  LeaveStatus,
  PayslipStatus,
  Role,
} from "@/types";

/** Plain, JSON-serializable shapes returned by the data layer to components. */

export interface EmployeeDTO {
  empId: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  department: string;
  designation: string;
  manager: string;
  doj: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  pan: string;
  monthlyGross: number;
}

export interface AttendanceDTO {
  empId: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  note: string;
}

export interface LeaveRequestDTO {
  id: string;
  empId: string;
  code: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  decidedBy: string;
  decidedOn: string;
}

export interface LeaveBalanceDTO {
  empId: string;
  code: string;
  total: number;
  used: number;
}

export interface HolidayDTO {
  date: string;
  name: string;
}

export interface PayslipDTO {
  id: string;
  empId: string;
  month: number;
  year: number;
  label: string;
  basic: number;
  hra: number;
  special: number;
  gross: number;
  pf: number;
  tax: number;
  deductions: number;
  net: number;
  status: PayslipStatus;
  paidOn: string;
}

export interface UserDTO {
  username: string;
  role: Role;
  empId: string;
}
