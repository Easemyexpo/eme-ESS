"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui";
import { LeaveDecisionButtons } from "@/components/LeaveDecisionButtons";
import { fmtDate } from "@/lib/dates";
import { leaveTypeName } from "@/lib/badges";
import type { EmployeeDTO, LeaveRequestDTO } from "@/types/dto";

const TABS = ["Pending", "Approved", "Rejected", "All"] as const;
type Tab = (typeof TABS)[number];

export function LeaveManager({
  requests,
  employees,
}: {
  requests: LeaveRequestDTO[];
  employees: EmployeeDTO[];
}) {
  const [tab, setTab] = useState<Tab>("Pending");

  const nameByEmp = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employees) map.set(e.empId, e.fullName);
    return map;
  }, [employees]);

  const list = useMemo(() => {
    if (tab === "All") return requests;
    return requests.filter((r) => r.status === tab);
  }, [requests, tab]);

  return (
    <>
      <div className="tabs section-gap">
        {TABS.map((t) => (
          <div
            key={t}
            className={`tab ${t === tab ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length ? (
                list.map((r) => (
                  <tr key={r.id}>
                    <td>{nameByEmp.get(r.empId) ?? r.empId}</td>
                    <td>{leaveTypeName(r.code)}</td>
                    <td>{fmtDate(r.from)}</td>
                    <td>{fmtDate(r.to)}</td>
                    <td>{r.days}</td>
                    <td className="wrap">{r.reason}</td>
                    <td>{fmtDate(r.appliedOn)}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                    <td>
                      {r.status === "Pending" ? (
                        <LeaveDecisionButtons id={r.id} />
                      ) : (
                        <span className="muted" style={{ fontSize: 12 }}>
                          {r.decidedBy || ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="muted">
                    No {tab.toLowerCase()} requests.
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
