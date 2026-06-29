export const dynamic = "force-dynamic";

import { AttendanceMonitor } from "@/components/admin/AttendanceMonitor";
import { listAllAttendance, listEmployees } from "@/lib/data";
import { todayIso } from "@/lib/dates";

export default async function AdminAttendancePage() {
  const [attendance, employees] = await Promise.all([listAllAttendance(), listEmployees()]);
  return <AttendanceMonitor attendance={attendance} employees={employees} today={todayIso()} />;
}