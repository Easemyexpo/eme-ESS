import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/types";

export interface SessionUser {
  id: string;
  empId: string;
  role: Role;
  name: string;
}

/**
 * Returns the current authenticated user or redirects to /login. Use in pages
 * and server actions that require any logged-in user.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.empId) redirect("/login");
  const u = session.user;
  return {
    id: u.id,
    empId: u.empId,
    role: u.role,
    name: u.name ?? u.empId,
  };
}

/** Like {@link requireUser} but additionally enforces the admin role. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
