export const dynamic = "force-dynamic";

import { EmployeeManager } from "@/components/admin/EmployeeManager";
import { listEmployees, listUsers } from "@/lib/data";

export default async function AdminEmployeesPage() {
  const [employees, users] = await Promise.all([listEmployees(), listUsers()]);
  return <EmployeeManager employees={employees} users={users} />;
}