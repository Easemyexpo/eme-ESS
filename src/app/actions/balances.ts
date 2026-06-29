"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { LeaveBalance } from "@/models";
import { requireAdmin } from "@/lib/session";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const adjustSchema = z.object({
  empId: z.string().min(1),
  balances: z.array(
    z.object({
      code: z.enum(["EL", "SL"]),
      total: z.coerce.number().min(0),
      used: z.coerce.number().min(0),
    }),
  ),
});

/** Admin adjusts an employee's leave totals/used counts (upsert per type). */
export async function adjustBalancesAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid input." };
  const { empId, balances } = parsed.data;

  await dbConnect();
  await Promise.all(
    balances.map((b) =>
      LeaveBalance.findOneAndUpdate(
        { empId, code: b.code },
        { $set: { total: b.total, used: b.used } },
        { upsert: true },
      ),
    ),
  );

  revalidatePath("/admin/balances");
  return { ok: true, message: "Balances updated" };
}
