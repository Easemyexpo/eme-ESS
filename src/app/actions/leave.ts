"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { Employee, Holiday, LeaveBalance, LeaveRequest } from "@/models";
import { requireAdmin, requireUser } from "@/lib/session";
import { todayIso, workingDays, fromIso } from "@/lib/dates";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

const applySchema = z.object({
  code: z.enum(["EL", "SL"]),
  from: isoDate,
  to: isoDate,
  reason: z.string().trim().min(1, "Please provide a reason."),
});

/** Employee submits a leave request. Validates dates, working days and balance. */
export async function applyLeaveAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = applySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { code, from, to, reason } = parsed.data;

  if (fromIso(to) < fromIso(from)) {
    return { ok: false, message: "End date can't be before start date." };
  }

  await dbConnect();
  const holidayDates = new Set((await Holiday.find().select("date").lean()).map((h) => h.date));
  const days = workingDays(from, to, holidayDates);
  if (days < 1) {
    return { ok: false, message: "Selected range has no working days." };
  }

  const bal = await LeaveBalance.findOne({ empId: user.empId, code });
  if (bal && days > bal.total - bal.used) {
    return { ok: false, message: `Insufficient balance. Only ${bal.total - bal.used} day(s) left.` };
  }

  await LeaveRequest.create({
    empId: user.empId,
    code,
    from,
    to,
    days,
    reason,
    status: "Pending",
    appliedOn: todayIso(),
    decidedBy: "",
    decidedOn: "",
  });

  revalidatePath("/leave");
  revalidatePath("/dashboard");
  return { ok: true, message: "Leave request submitted" };
}

const decideSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["Approved", "Rejected"]),
});

/** Admin approves or rejects a pending leave request. */
export async function decideLeaveAction(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = decideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid input." };
  const { id, decision } = parsed.data;

  await dbConnect();
  const req = await LeaveRequest.findById(id);
  if (!req || req.status !== "Pending") {
    return { ok: false, message: "Request is no longer pending." };
  }

  const adminEmp = await Employee.findOne({ empId: admin.empId }).select("fullName").lean();

  req.status = decision;
  req.decidedBy = adminEmp?.fullName ?? admin.empId;
  req.decidedOn = todayIso();
  await req.save();

  if (decision === "Approved") {
    const bal = await LeaveBalance.findOne({ empId: req.empId, code: req.code });
    if (bal) {
      bal.used = Math.min(bal.total, bal.used + req.days);
      await bal.save();
    }
  }

  revalidatePath("/admin/leave");
  revalidatePath("/dashboard");
  revalidatePath("/admin/balances");
  return { ok: true, message: `Leave ${decision.toLowerCase()}` };
}
