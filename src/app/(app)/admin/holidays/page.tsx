export const dynamic = "force-dynamic";

import { HolidayManager } from "@/components/admin/HolidayManager";
import { listHolidays } from "@/lib/data";

export default async function AdminHolidaysPage() {
  const holidays = await listHolidays();
  return <HolidayManager holidays={holidays} />;
}