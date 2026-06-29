import type { SalaryBreakdown } from "@/types";

/** Indian-format currency, e.g. ₹1,20,000. */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Derive a full salary breakdown from a monthly gross figure. Mirrors the
 * prototype's `salaryBreakdown`:
 *   basic   = 50% of gross
 *   hra     = 20% of gross
 *   special = remainder
 *   pf      = 12% of basic
 *   tax     = 8% of gross
 */
export function salaryBreakdown(monthlyGross: number): SalaryBreakdown {
  const gross = Math.round(monthlyGross);
  const basic = Math.round(gross * 0.5);
  const hra = Math.round(gross * 0.2);
  const special = gross - basic - hra;
  const pf = Math.round(basic * 0.12);
  const tax = Math.round(gross * 0.08);
  const deductions = pf + tax;
  const net = gross - deductions;
  return { gross, basic, hra, special, pf, tax, deductions, net };
}
