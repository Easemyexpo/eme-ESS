export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { ProfileView } from "@/components/ProfileView";
import { getEmployee, getUserByEmp } from "@/lib/data";

export default async function ProfilePage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin/employees");

  const [emp, account] = await Promise.all([
    getEmployee(user.empId),
    getUserByEmp(user.empId),
  ]);
  if (!emp) notFound();

  return <ProfileView emp={emp} username={account?.username ?? "\u2014"} />;
}