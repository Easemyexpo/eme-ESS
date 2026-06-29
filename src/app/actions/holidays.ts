"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { Holiday } from "@/models";
import { requireAdmin } from "@/lib/session";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const saveSchema = z.object({
  originalDate: z.string().optional(), // present when editing
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  name: z.string().trim().min(1, "Please enter a holiday name."),
});

/** Admin adds or edits a public holiday. */
export async function saveHolidayAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { originalDate, date, name } = parsed.data;

  await dbConnect();
  const clash = await Holiday.findOne({ date });
  if (clash && clash.date !== originalDate) {
    return { ok: false, message: "A holiday already exists on that date." };
  }

  if (originalDate) {
    await Holiday.findOneAndUpdate({ date: originalDate }, { $set: { date, name } });
  } else {
    await Holiday.create({ date, name });
  }

  revalidatePath("/admin/holidays");
  return { ok: true, message: originalDate ? "Holiday updated" : "Holiday added" };
}

/** Admin removes a public holiday. */
export async function deleteHolidayAction(date: string): Promise<ActionResult> {
  await requireAdmin();
  await dbConnect();
  await Holiday.deleteOne({ date });
  revalidatePath("/admin/holidays");
  return { ok: true, message: "Holiday removed" };
}
