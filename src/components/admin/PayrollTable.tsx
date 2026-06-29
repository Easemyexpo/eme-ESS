"use client";

import { useMemo, useState } from "react";
import { fmtDate } from "@/lib/dates";
import { salaryBreakdown, formatINR } from "@/lib/money";
import type { EmployeeDTO } from "@/types/dto";

export function PayrollTable({ employees }: { employees: EmployeeDTO[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) => e.fullName.toLowerCase().includes(q) || e.empId.toLowerCase().includes(q),
    );
  }, [employees, query]);

  return (
    <>
      <div className="page-head">
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search by name or employee ID..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Date of Joining</th>
                <th>Monthly Gross</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((e) => {
                  const b = salaryBreakdown(e.monthlyGross);
                  return (
                    <tr key={e.empId}>
                      <td>
                        {e.fullName}{" "}
                        <span className="muted" style={{ fontSize: 12 }}>
                          ({e.empId})
                        </span>
                      </td>
                      <td>{e.designation}</td>
                      <td>{e.department}</td>
                      <td>{fmtDate(e.doj)}</td>
                      <td>{formatINR(b.gross)}</td>
                      <td>
                        <strong>{formatINR(b.net)}</strong>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="muted">
                    No employees match.
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
