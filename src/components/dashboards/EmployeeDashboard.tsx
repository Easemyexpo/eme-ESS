import Link from "next/link";
import { StatCard } from "@/components/ui";
import { Badge, StatusOrGray } from "@/components/ui";
import { TodayPanel } from "@/components/TodayPanel";
import { BalanceBars, UpcomingLeaveList, HolidayList } from "@/components/lists";
import {
  getEmployee,
  getEmpAttendance,
  getEmpBalances,
  getEmpRequests,
  getEmpPayslips,
  listHolidays,
} from "@/lib/data";
import { todayIso, fmtDate } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { leaveTypeName } from "@/lib/badges";
import { notFound } from "next/navigation";

interface ActivityRow {
  date: string;
  type: string;
  detail: string;
  status: string;
}

export async function EmployeeDashboard({ empId }: { empId: string }) {
  const today = todayIso();
  const [emp, att, bals, reqs, payslips, holidays] = await Promise.all([
    getEmployee(empId),
    getEmpAttendance(empId),
    getEmpBalances(empId),
    getEmpRequests(empId),
    getEmpPayslips(empId),
    listHolidays(),
  ]);
  if (!emp) notFound();

  const todayRec = att.find((a) => a.date === today) ?? null;
  const monthPrefix = today.slice(0, 7);
  const monthAtt = att.filter((a) => a.date.startsWith(monthPrefix));
  const present = monthAtt.filter((a) => a.status === "Present" || a.status === "Late").length;
  const totalAvail = bals.reduce((s, b) => s + (b.total - b.used), 0);
  const pending = reqs.filter((r) => r.status === "Pending").length;
  const lastSlip = payslips[0];

  const upcoming = reqs
    .filter((r) => r.to >= today && (r.status === "Approved" || r.status === "Pending"))
    .sort((a, b) => a.from.localeCompare(b.from))
    .slice(0, 5);

  const upcomingHolidays = holidays
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const activity: ActivityRow[] = [];
  att.slice(0, 4).forEach((a) =>
    activity.push({
      date: a.date,
      type: "Attendance",
      detail: a.checkIn ? `In ${a.checkIn} \u00B7 Out ${a.checkOut || "\u2014"}` : "\u2014",
      status: a.status,
    }),
  );
  reqs.slice(0, 3).forEach((r) =>
    activity.push({
      date: r.appliedOn,
      type: "Leave",
      detail: `${leaveTypeName(r.code)} \u00B7 ${r.days}d`,
      status: r.status,
    }),
  );
  activity.sort((a, b) => b.date.localeCompare(a.date));
  const recent = activity.slice(0, 6);

  return (
    <>
      <div className="page-head">
        <div>
          <h2 style={{ fontSize: 20 }}>Welcome back, {emp.fullName.split(" ")[0]} {"\u{1F44B}"}</h2>
        </div>
      </div>

      <div className="grid grid-4 section-gap">
        <StatCard color="indigo" ico={"\u23F1"} value={present} label="Days present (this month)" />
        <StatCard color="blue" ico={"\u2708"} value={totalAvail} label="Leave days available" />
        <StatCard color="amber" ico={"\u23F3"} value={pending} label="Pending leave requests" />
        <StatCard
          color="green"
          ico={"\u20B9"}
          value={lastSlip ? formatINR(lastSlip.net) : "\u2014"}
          label="Last net pay"
        />
      </div>

      <div className="grid grid-2 section-gap">
        <div className="card">
          <div className="card-head">
            <h3>Today&apos;s Attendance</h3>
            <StatusOrGray status={todayRec?.status} />
          </div>
          <div className="card-pad">
            <TodayPanel today={todayRec} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Leave Balance</h3>
            <Link className="btn btn-sm btn-soft" href="/leave">
              Manage
            </Link>
          </div>
          <div className="card-pad">
            <BalanceBars bals={bals} />
          </div>
        </div>
      </div>

      <div className="grid grid-2 section-gap">
        <div className="card">
          <div className="card-head">
            <h3>My Upcoming Leaves</h3>
            <Link className="btn btn-sm btn-soft" href="/leave">
              Apply
            </Link>
          </div>
          <div className="card-pad">
            <UpcomingLeaveList requests={upcoming} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Upcoming Holidays</h3>
            <Link className="btn btn-sm btn-soft" href="/attendance">
              Calendar
            </Link>
          </div>
          <div className="card-pad">
            <HolidayList holidays={upcomingHolidays} />
          </div>
        </div>
      </div>

      <div className="card section-gap">
        <div className="card-head">
          <h3>Recent Activity</h3>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Detail</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((r, i) => (
                  <tr key={i}>
                    <td>{fmtDate(r.date)}</td>
                    <td>{r.type}</td>
                    <td>{r.detail}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="muted">
                    No activity yet.
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
