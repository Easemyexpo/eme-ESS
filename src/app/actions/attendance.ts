"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Attendance } from "@/models";
import { requireUser } from "@/lib/session";
import { todayIso, nowTime, getISTDate } from "@/lib/dates";
import { LATE_THRESHOLD_HOUR } from "@/lib/constants";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Records the current user's check-in for today. */
export async function checkInAction(): Promise<ActionResult> {
  const user = await requireUser();
  await dbConnect();

  const date = todayIso();
  const time = nowTime();
  const existing = await Attendance.findOne({ empId: user.empId, date });

  if (existing?.status === "Leave") {
    return { ok: false, message: "You are on approved leave today." };
  }

  if (!existing) {
    await Attendance.create({
      empId: user.empId,
      date,
      checkIn: time,
      checkOut: "",
      status: getISTDate().getHours() >= LATE_THRESHOLD_HOUR ? "Late" : "Present",
    });
  } else {
    existing.checkIn = time;
    await existing.save();
  }

  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  return { ok: true, message: `Checked in at ${time}` };
}

/** Records the current user's check-out for today. */
export async function checkOutAction(): Promise<ActionResult> {
  const user = await requireUser();
  await dbConnect();

  const date = todayIso();
  const time = nowTime();
  const existing = await Attendance.findOne({ empId: user.empId, date });

  if (!existing || !existing.checkIn) {
    return { ok: false, message: "You need to check in first." };
  }

  existing.checkOut = time;
  await existing.save();

  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  return { ok: true, message: `Checked out at ${time}` };
}
