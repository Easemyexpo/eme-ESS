import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/session";
import { getEmployee } from "@/lib/data";
import { dbConnect } from "@/lib/mongodb";
import { LeaveRequest } from "@/models";
import { prettyDate, todayIso } from "@/lib/dates";

// The entire authenticated area reads the session and live data on every
// request — never statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const emp = await getEmployee(user.empId);

  let pendingLeaves = 0;
  if (user.role === "admin") {
    await dbConnect();
    pendingLeaves = await LeaveRequest.countDocuments({ status: "Pending" });
  }

  return (
    <AppShell
      role={user.role}
      fullName={emp?.fullName ?? user.empId}
      roleLabel={user.role === "admin" ? "Administrator" : (emp?.designation ?? "Employee")}
      todayLong={prettyDate(todayIso())}
      pendingLeaves={pendingLeaves}
    >
      {children}
    </AppShell>
  );
}
