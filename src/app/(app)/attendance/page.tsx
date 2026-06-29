export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { StatusOrGray, Badge } from "@/components/ui";
import { TodayPanel } from "@/components/TodayPanel";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { getEmpAttendance, getEmpBalances, listHolidays } from "@/lib/data";
import { todayIso, prettyDate, fmtDate, dowShort } from "@/lib/dates";

export default async function AttendancePage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin/attendance");

  const today = todayIso();
  const [att, balances, holidays] = await Promise.all([
    getEmpAttendance(user.empId),
    getEmpBalances(user.empId),
    listHolidays(),
  ]);
  const todayRec = att.find((a) => a.date === today) ?? null;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="sub">Mark daily attendance and review your history.</div>
        </div>
      </div>

      <div className="card section-gap">
        <div className="card-head">
          <h3>
            Today {"\u00B7"} {prettyDate(today)}
          </h3>
          <StatusOrGray status={todayRec?.status} />
        </div>
        <div className="card-pad">
          <TodayPanel today={todayRec} />
        </div>
      </div>

      <div className="card section-gap">
        <div className="card-pad">
          <AttendanceCalendar attendance={att} holidays={holidays} balances={balances} today={today} />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Attendance History</h3>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {att.length ? (
                att.slice(0, 30).map((a) => (
                  <tr key={a.date}>
                    <td>{fmtDate(a.date)}</td>
                    <td>{dowShort(a.date)}</td>
                    <td>{a.checkIn || "\u2014"}</td>
                    <td>{a.checkOut || "\u2014"}</td>
                    <td>
                      <Badge status={a.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="muted">
                    No records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}