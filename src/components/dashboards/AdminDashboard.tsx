import Link from "next/link";
import { StatCard, Badge } from "@/components/ui";
import { OrgLeaveList } from "@/components/lists";
import { LeaveDecisionButtons } from "@/components/LeaveDecisionButtons";
import { listEmployees, getAttendanceForDate, listLeaveRequests } from "@/lib/data";
import { todayIso, prettyDate, fmtDate } from "@/lib/dates";
import { leaveTypeName } from "@/lib/badges";

export async function AdminDashboard() {
  const today = todayIso();
  const [employees, todayRecs, requests] = await Promise.all([
    listEmployees(),
    getAttendanceForDate(today),
    listLeaveRequests(),
  ]);

  const totalEmp = employees.length;
  const presentToday = todayRecs.filter((a) => a.status === "Present" || a.status === "Late").length;
  const onLeaveToday = todayRecs.filter((a) => a.status === "Leave").length;
  const pending = requests.filter((r) => r.status === "Pending");

  const deptCount: Record<string, number> = {};
  employees.forEach((e) => (deptCount[e.department] = (deptCount[e.department] || 0) + 1));

  const orgLeave = requests
    .filter((r) => r.to >= today && (r.status === "Approved" || r.status === "Pending"))
    .sort((a, b) => a.from.localeCompare(b.from))
    .slice(0, 8);

  const byId = new Map(employees.map((e) => [e.empId, e]));
  const recByEmp = new Map(todayRecs.map((a) => [a.empId, a]));

  return (
    <>
      <div className="page-head">
        <div>
          <div className="sub">Organisation overview {"\u2014"} {prettyDate(today)}.</div>
        </div>
      </div>

      <div className="grid grid-4 section-gap">
        <StatCard color="indigo" ico={"\u263B"} value={totalEmp} label="Total employees" />
        <StatCard color="green" ico={"\u23F1"} value={presentToday} label="Present today" />
        <StatCard color="blue" ico={"\u2708"} value={onLeaveToday} label="On leave today" />
        <StatCard color="amber" ico={"\u23F3"} value={pending.length} label="Pending approvals" />
      </div>

      <div className="grid grid-2 section-gap">
        <div className="card">
          <div className="card-head">
            <h3>Pending Leave Requests</h3>
            <Link className="btn btn-sm btn-soft" href="/admin/leave">
              View all
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.length ? (
                  pending.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td>{byId.get(r.empId)?.fullName ?? r.empId}</td>
                      <td>{leaveTypeName(r.code)}</td>
                      <td>
                        {fmtDate(r.from)} {"\u2013"} {fmtDate(r.to)}
                      </td>
                      <td>{r.days}</td>
                      <td className="row-actions">
                        <LeaveDecisionButtons id={r.id} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="muted">
                      No pending requests {"\u{1F389}"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Headcount by Department</h3>
          </div>
          <div className="card-pad">
            {Object.entries(deptCount).map(([d, c]) => {
              const pct = Math.round((c / totalEmp) * 100);
              return (
                <div className="bal-row" key={d}>
                  <div className="bal-top">
                    <span>{d}</span>
                    <span>
                      <strong>{c}</strong> staff
                    </span>
                  </div>
                  <div className="bar">
                    <span className="el" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card section-gap">
        <div className="card-head">
          <h3>On Leave &amp; Upcoming</h3>
          <Link className="btn btn-sm btn-soft" href="/admin/leave">
            Requests
          </Link>
        </div>
        <div className="card-pad">
          <OrgLeaveList requests={orgLeave} employees={employees} today={today} />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Today&apos;s Attendance Snapshot</h3>
          <Link className="btn btn-sm btn-soft" href="/admin/attendance">
            Monitor
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const r = recByEmp.get(e.empId);
                return (
                  <tr key={e.empId}>
                    <td>{e.fullName}</td>
                    <td>{e.department}</td>
                    <td>{r?.checkIn || "\u2014"}</td>
                    <td>{r?.checkOut || "\u2014"}</td>
                    <td>{r ? <Badge status={r.status} /> : <span className="badge red">Absent</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
