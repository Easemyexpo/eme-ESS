export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui";
import { ApplyLeaveButton } from "@/components/ApplyLeaveButton";
import { getEmpBalances, getEmpRequests, listHolidays } from "@/lib/data";
import { todayIso, fmtDate } from "@/lib/dates";
import { leaveTypeName } from "@/lib/badges";

export default async function LeavePage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin/leave");

  const today = todayIso();
  const [bals, reqs, holidays] = await Promise.all([
    getEmpBalances(user.empId),
    getEmpRequests(user.empId),
    listHolidays(),
  ]);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="sub">Apply for leave and track your requests.</div>
        </div>
        <ApplyLeaveButton balances={bals} holidays={holidays} today={today} />
      </div>

      <div className="grid grid-3 section-gap">
        {bals.map((b) => {
          const avail = b.total - b.used;
          return (
            <div className="card stat" key={b.code}>
              <div className="stat-ico blue">{"\u2708"}</div>
              <div className="stat-meta">
                <div className="stat-value">
                  {avail}
                  <span style={{ fontSize: 13, color: "var(--muted)" }}> / {b.total}</span>
                </div>
                <div className="stat-label">
                  {leaveTypeName(b.code)} {"\u00B7"} {b.used} used
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>My Leave Requests</h3>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Applied</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reqs.length ? (
                reqs.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.appliedOn)}</td>
                    <td>{leaveTypeName(r.code)}</td>
                    <td>{fmtDate(r.from)}</td>
                    <td>{fmtDate(r.to)}</td>
                    <td>{r.days}</td>
                    <td className="wrap">{r.reason}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="muted">
                    No leave requests yet.
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