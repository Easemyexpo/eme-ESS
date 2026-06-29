import { requireAdmin } from "@/lib/session";

// Admin views are authenticated and read live data on every request — never
// statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
