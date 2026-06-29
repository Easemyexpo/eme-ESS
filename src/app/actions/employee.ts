"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import {
  Attendance,
  Employee,
  LeaveBalance,
  LeaveRequest,
  Payslip,
  User,
  nextSequence,
} from "@/models";
import { requireAdmin } from "@/lib/session";
import { LEAVE_TYPES } from "@/lib/constants";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const employeeSchema = z.object({
  empId: z.string().trim().optional(), // present when editing
  fullName: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Valid email required.").or(z.literal("")),
  phone: z.string().trim(),
  gender: z.string().trim(),
  dob: z.string().trim(),
  address: z.string().trim(),
  department: z.string().trim(),
  designation: z.string().trim(),
  manager: z.string().trim(),
  doj: z.string().trim(),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Intern"]),
  status: z.enum(["Active", "Inactive"]),
  bankName: z.string().trim(),
  bankAccount: z.string().trim(),
  ifsc: z.string().trim(),
  pan: z.string().trim(),
  monthlyGross: z.coerce.number().min(0),
  username: z.string().trim().toLowerCase(),
  password: z.string(),
  role: z.enum(["admin", "employee"]),
});

/** Admin creates a new employee, mints the next EMP id, login + leave balances. */
export async function createEmployeeAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const d = parsed.data;

  await dbConnect();

  if (d.username) {
    const clash = await User.findOne({ username: d.username });
    if (clash) return { ok: false, message: "Username already taken." };
  }

  const seq = await nextSequence("empId");
  const empId = "EMP" + String(seq).padStart(3, "0");

  await Employee.create({
    empId,
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    gender: d.gender,
    dob: d.dob,
    address: d.address,
    department: d.department,
    designation: d.designation,
    manager: d.manager,
    doj: d.doj,
    employmentType: d.employmentType,
    status: d.status,
    bankName: d.bankName,
    bankAccount: d.bankAccount,
    ifsc: d.ifsc,
    pan: d.pan,
    monthlyGross: d.monthlyGross,
  });

  await LeaveBalance.insertMany(
    LEAVE_TYPES.map((t) => ({ empId, code: t.code, total: t.total, used: 0 })),
  );

  if (d.username) {
    await User.create({
      username: d.username,
      passwordHash: await bcrypt.hash(d.password || "pass123", 10),
      role: d.role,
      empId,
    });
  }

  revalidatePath("/admin/employees");
  return { ok: true, message: "Employee created" };
}

/** Admin updates an existing employee record and (optionally) their login. */
export async function updateEmployeeAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const d = parsed.data;
  if (!d.empId) return { ok: false, message: "Missing employee id." };

  await dbConnect();
  const emp = await Employee.findOne({ empId: d.empId });
  if (!emp) return { ok: false, message: "Employee not found." };

  if (d.username) {
    const clash = await User.findOne({ username: d.username, empId: { $ne: d.empId } });
    if (clash) return { ok: false, message: "Username already taken." };
  }

  Object.assign(emp, {
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    gender: d.gender,
    dob: d.dob,
    address: d.address,
    department: d.department,
    designation: d.designation,
    manager: d.manager,
    doj: d.doj,
    employmentType: d.employmentType,
    status: d.status,
    bankName: d.bankName,
    bankAccount: d.bankAccount,
    ifsc: d.ifsc,
    pan: d.pan,
    monthlyGross: d.monthlyGross,
  });
  await emp.save();

  if (d.username) {
    const user = await User.findOne({ empId: d.empId });
    if (user) {
      user.username = d.username;
      user.role = d.role;
      if (d.password) user.passwordHash = await bcrypt.hash(d.password, 10);
      await user.save();
    } else {
      await User.create({
        username: d.username,
        passwordHash: await bcrypt.hash(d.password || "pass123", 10),
        role: d.role,
        empId: d.empId,
      });
    }
  }

  revalidatePath("/admin/employees");
  revalidatePath("/admin/payroll");
  revalidatePath("/profile");
  return { ok: true, message: "Employee updated" };
}

const contactSchema = z.object({
  empId: z.string().min(1),
  email: z.string().trim(),
  phone: z.string().trim(),
  manager: z.string().trim(),
  address: z.string().trim(),
  bankName: z.string().trim(),
  bankAccount: z.string().trim(),
  ifsc: z.string().trim(),
});

/** Admin-only contact & bank edit (employees have read-only profiles). */
export async function updateContactAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid input." };
  const d = parsed.data;

  await dbConnect();
  const emp = await Employee.findOne({ empId: d.empId });
  if (!emp) return { ok: false, message: "Employee not found." };

  emp.email = d.email;
  emp.phone = d.phone;
  emp.manager = d.manager;
  emp.address = d.address;
  emp.bankName = d.bankName;
  emp.bankAccount = d.bankAccount;
  emp.ifsc = d.ifsc;
  await emp.save();

  revalidatePath("/admin/employees");
  return { ok: true, message: "Profile updated" };
}

/** Admin deletes an employee and all of their related records. */
export async function deleteEmployeeAction(empId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (empId === admin.empId) {
    return { ok: false, message: "You can't delete your own account." };
  }

  await dbConnect();
  await Promise.all([
    Employee.deleteOne({ empId }),
    User.deleteOne({ empId }),
    Attendance.deleteMany({ empId }),
    LeaveRequest.deleteMany({ empId }),
    LeaveBalance.deleteMany({ empId }),
    Payslip.deleteMany({ empId }),
  ]);

  revalidatePath("/admin/employees");
  return { ok: true, message: "Employee deleted" };
}
