export const dynamic = "force-dynamic";

import { LeaveManager } from "@/components/admin/LeaveManager";
import { listEmployees, listLeaveRequests } from "@/lib/data";

export default async function AdminLeavePage() {
  const [requests, employees] = await Promise.all([listLeaveRequests(), listEmployees()]);
  return <LeaveManager requests={requests} employees={employees} />;
}