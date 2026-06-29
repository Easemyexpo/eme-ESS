export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/session";
import { EmployeeDashboard } from "@/components/dashboards/EmployeeDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "admin") return <AdminDashboard />;
  return <EmployeeDashboard empId={user.empId} />;
}