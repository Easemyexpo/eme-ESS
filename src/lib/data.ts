import "server-only";
import { dbConnect } from "@/lib/mongodb";
import {
  Employee,
  User,
  Attendance,
  LeaveRequest,
  LeaveBalance,
  Holiday,
  Payslip,
} from "@/models";
import type {
  AttendanceDTO,
  EmployeeDTO,
  HolidayDTO,
  LeaveBalanceDTO,
  LeaveRequestDTO,
  PayslipDTO,
  UserDTO,
} from "@/types/dto";

/**
 * Read-only data-access layer. Every function connects (cached) and returns
 * plain serializable DTOs — never Mongoose documents — so results are safe to
 * pass from Server Components into Client Components.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapEmployee(e: any): EmployeeDTO {
  return {
    empId: e.empId,
    fullName: e.fullName,
    email: e.email ?? "",
    phone: e.phone ?? "",
    gender: e.gender ?? "",
    dob: e.dob ?? "",
    address: e.address ?? "",
    department: e.department ?? "",
    designation: e.designation ?? "",
    manager: e.manager ?? "",
    doj: e.doj ?? "",
    employmentType: e.employmentType ?? "Full-time",
    status: e.status ?? "Active",
    bankName: e.bankName ?? "",
    bankAccount: e.bankAccount ?? "",
    ifsc: e.ifsc ?? "",
    pan: e.pan ?? "",
    monthlyGross: e.monthlyGross ?? 0,
  };
}

function mapAttendance(a: any): AttendanceDTO {
  return {
    empId: a.empId,
    date: a.date,
    status: a.status,
    checkIn: a.checkIn ?? "",
    checkOut: a.checkOut ?? "",
    note: a.note ?? "",
  };
}

function mapRequest(r: any): LeaveRequestDTO {
  return {
    id: String(r._id),
    empId: r.empId,
    code: r.code,
    from: r.from,
    to: r.to,
    days: r.days,
    reason: r.reason ?? "",
    status: r.status,
    appliedOn: r.appliedOn,
    decidedBy: r.decidedBy ?? "",
    decidedOn: r.decidedOn ?? "",
  };
}

function mapBalance(b: any): LeaveBalanceDTO {
  return { empId: b.empId, code: b.code, total: b.total, used: b.used };
}

function mapHoliday(h: any): HolidayDTO {
  return { date: h.date, name: h.name };
}

function mapPayslip(p: any): PayslipDTO {
  return {
    id: String(p._id),
    empId: p.empId,
    month: p.month,
    year: p.year,
    label: p.label,
    basic: p.basic,
    hra: p.hra,
    special: p.special,
    gross: p.gross,
    pf: p.pf,
    tax: p.tax,
    deductions: p.deductions,
    net: p.net,
    status: p.status,
    paidOn: p.paidOn ?? "",
  };
}

/* ---------- employees ---------- */

export async function getEmployee(empId: string): Promise<EmployeeDTO | null> {
  await dbConnect();
  const e = await Employee.findOne({ empId }).lean();
  return e ? mapEmployee(e) : null;
}

export async function listEmployees(): Promise<EmployeeDTO[]> {
  await dbConnect();
  const list = await Employee.find().sort({ empId: 1 }).lean();
  return list.map(mapEmployee);
}

export async function getUserByEmp(empId: string): Promise<UserDTO | null> {
  await dbConnect();
  const u = await User.findOne({ empId }).select("username role empId").lean();
  return u ? { username: u.username, role: u.role, empId: u.empId } : null;
}

export async function listUsers(): Promise<UserDTO[]> {
  await dbConnect();
  const list = await User.find().select("username role empId").lean();
  return list.map((u: any) => ({ username: u.username, role: u.role, empId: u.empId }));
}

/* ---------- attendance ---------- */

export async function getEmpAttendance(empId: string): Promise<AttendanceDTO[]> {
  await dbConnect();
  const list = await Attendance.find({ empId }).sort({ date: -1 }).lean();
  return list.map(mapAttendance);
}

export async function getAttendanceForDate(date: string): Promise<AttendanceDTO[]> {
  await dbConnect();
  const list = await Attendance.find({ date }).lean();
  return list.map(mapAttendance);
}

export async function getTodayAttendance(
  empId: string,
  date: string,
): Promise<AttendanceDTO | null> {
  await dbConnect();
  const a = await Attendance.findOne({ empId, date }).lean();
  return a ? mapAttendance(a) : null;
}

export async function listAllAttendance(): Promise<AttendanceDTO[]> {
  await dbConnect();
  const list = await Attendance.find().sort({ date: -1, empId: 1 }).lean();
  return list.map(mapAttendance);
}

export async function queryAttendance(
  empId: string | null,
  date: string | null,
): Promise<AttendanceDTO[]> {
  await dbConnect();
  const filter: Record<string, string> = {};
  if (empId) filter.empId = empId;
  if (date) filter.date = date;
  const list = await Attendance.find(filter)
    .sort({ date: -1, empId: 1 })
    .limit(200)
    .lean();
  return list.map(mapAttendance);
}

/* ---------- leave ---------- */

export async function getEmpRequests(empId: string): Promise<LeaveRequestDTO[]> {
  await dbConnect();
  const list = await LeaveRequest.find({ empId }).sort({ appliedOn: -1 }).lean();
  return list.map(mapRequest);
}

export async function listLeaveRequests(): Promise<LeaveRequestDTO[]> {
  await dbConnect();
  const list = await LeaveRequest.find().sort({ appliedOn: -1 }).lean();
  return list.map(mapRequest);
}

export async function getEmpBalances(empId: string): Promise<LeaveBalanceDTO[]> {
  await dbConnect();
  const list = await LeaveBalance.find({ empId }).lean();
  // Preserve the EL, SL display order.
  const order = ["EL", "SL"];
  return list
    .map(mapBalance)
    .sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
}

export async function listBalances(): Promise<LeaveBalanceDTO[]> {
  await dbConnect();
  const list = await LeaveBalance.find().lean();
  return list.map(mapBalance);
}

/* ---------- holidays ---------- */

export async function listHolidays(): Promise<HolidayDTO[]> {
  await dbConnect();
  const list = await Holiday.find().sort({ date: 1 }).lean();
  return list.map(mapHoliday);
}

/* ---------- payroll ---------- */

export async function getEmpPayslips(empId: string): Promise<PayslipDTO[]> {
  await dbConnect();
  const list = await Payslip.find({ empId }).sort({ year: -1, month: -1 }).lean();
  return list.map(mapPayslip);
}
