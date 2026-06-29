export const dynamic = "force-dynamic";

import { BalanceManager } from "@/components/admin/BalanceManager";
import { listBalances, listEmployees } from "@/lib/data";

export default async function AdminBalancesPage() {
  const [employees, balances] = await Promise.all([listEmployees(), listBalances()]);
  return <BalanceManager employees={employees} balances={balances} />;
}