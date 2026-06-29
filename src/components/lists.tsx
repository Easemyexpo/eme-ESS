import { fromIso, fmtDate, monthAbbr, dowShort } from "@/lib/dates";
import { leaveTypeName } from "@/lib/badges";
import type { EmployeeDTO, HolidayDTO, LeaveBalanceDTO, LeaveRequestDTO } from "@/types/dto";

const BAR_CLASS: Record<string, string> = { EL: "el", SL: "sl" };

export function BalanceBars({ bals }: { bals: LeaveBalanceDTO[] }) {
  return (
    <>
      {bals.map((b) => {
        const avail = b.total - b.used;
        const pct = b.total ? Math.round((b.used / b.total) * 100) : 0;
        return (
          <div className="bal-row" key={b.code}>
            <div className="bal-top">
              <span>{leaveTypeName(b.code)}</span>
              <span>
                <strong>{avail}</strong> / {b.total} left
              </span>
            </div>
            <div className="bar">
              <span className={BAR_CLASS[b.code] ?? "el"} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </>
  );
}

function dateRange(from: string, to: string): string {
  return from === to ? fmtDate(from) : `${fmtDate(from)} \u2013 ${fmtDate(to)}`;
}

function LeaveItem({ label, sub, r }: { label: string; sub: string; r: LeaveRequestDTO }) {
  const dt = fromIso(r.from);
  const badge = r.status === "Approved" ? "green" : r.status === "Pending" ? "amber" : "gray";
  return (
    <li className="holiday-item">
      <span className="holiday-date">
        <strong>{dt.getDate()}</strong>
        <span>{monthAbbr(dt.getMonth())}</span>
      </span>
      <span className="holiday-meta" style={{ flex: 1 }}>
        <span className="holiday-name">{label}</span>
        <span className="holiday-dow muted">
          {sub} {"\u00B7"} {dateRange(r.from, r.to)}
        </span>
      </span>
      <span className={`badge ${badge}`}>{r.status}</span>
    </li>
  );
}

/** Employee's own upcoming/approved leaves. */
export function UpcomingLeaveList({ requests }: { requests: LeaveRequestDTO[] }) {
  if (!requests.length) {
    return <div className="muted" style={{ fontSize: 13 }}>No upcoming leaves planned.</div>;
  }
  return (
    <ul className="holiday-list">
      {requests.map((r) => (
        <LeaveItem key={r.id} label={leaveTypeName(r.code)} sub={`${r.days}d`} r={r} />
      ))}
    </ul>
  );
}

/** Org-wide who's-on-leave list for the admin dashboard. */
export function OrgLeaveList({
  requests,
  employees,
  today,
}: {
  requests: LeaveRequestDTO[];
  employees: EmployeeDTO[];
  today: string;
}) {
  if (!requests.length) {
    return (
      <div className="muted" style={{ fontSize: 13 }}>
        No one is on leave or has upcoming leave.
      </div>
    );
  }
  const byId = new Map(employees.map((e) => [e.empId, e]));
  return (
    <ul className="holiday-list">
      {requests.map((r) => {
        const e = byId.get(r.empId);
        const onLeaveNow = r.status === "Approved" && r.from <= today && r.to >= today;
        const sub = onLeaveNow ? "On leave now" : `${leaveTypeName(r.code)} \u00B7 ${r.days}d`;
        return <LeaveItem key={r.id} label={e ? e.fullName : r.empId} sub={sub} r={r} />;
      })}
    </ul>
  );
}

export function HolidayList({ holidays }: { holidays: HolidayDTO[] }) {
  if (!holidays.length) {
    return <div className="muted" style={{ fontSize: 13 }}>No upcoming holidays this year.</div>;
  }
  return (
    <ul className="holiday-list">
      {holidays.map((h) => {
        const dt = fromIso(h.date);
        return (
          <li className="holiday-item" key={h.date}>
            <span className="holiday-date">
              <strong>{dt.getDate()}</strong>
              <span>{monthAbbr(dt.getMonth())}</span>
            </span>
            <span className="holiday-meta">
              <span className="holiday-name">{h.name}</span>
              <span className="holiday-dow muted">
                {dowShort(h.date)} {"\u00B7"} {h.date.slice(0, 4)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
