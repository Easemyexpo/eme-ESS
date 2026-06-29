export const dynamic = "force-dynamic";

import { PayrollTable } from "@/components/admin/PayrollTable";
import { listEmployees } from "@/lib/data";

export default async function AdminPayrollPage() {
  const employees = await listEmployees();
  return <PayrollTable employees={employees} />;
}