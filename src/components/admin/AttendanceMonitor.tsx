"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui";
import { useToast } from "@/components/ToastProvider";
import { fmtDate } from "@/lib/dates";
import type { AttendanceDTO, EmployeeDTO } from "@/types/dto";

/** Resolve a typed search string ("Alice Smith (EMP001)" / "EMP001" / "alice") to an empId, or "" for all. */
function resolveEmpId(str: string, employees: EmployeeDTO[]): string {
  const q = str.trim().toLowerCase();
  if (!q) return "";
  const m = q.match(/\(([a-z0-9]+)\)\s*$/i);
  if (m) {
    const byId = employees.find((e) => e.empId.toLowerCase() === m[1]);
    if (byId) return byId.empId;
  }
  const exactId = employees.find((e) => e.empId.toLowerCase() === q);
  if (exactId) return exactId.empId;
  const byName =
    employees.find((e) => e.fullName.toLowerCase() === q) ??
    employees.find(
      (e) => e.fullName.toLowerCase().includes(q) || e.empId.toLowerCase().includes(q),
    );
  return byName ? byName.empId : "";
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function AttendanceMonitor({
  attendance,
  employees,
  today,
}: {
  attendance: AttendanceDTO[];
  employees: EmployeeDTO[];
  today: string;
}) {
  const toast = useToast();
  const [empQuery, setEmpQuery] = useState("");
  const [date, setDate] = useState(today);

  const empById = useMemo(() => {
    const map = new Map<string, EmployeeDTO>();
    for (const e of employees) map.set(e.empId, e);
    return map;
  }, [employees]);

  const filtered = useMemo(() => {
    const empId = resolveEmpId(empQuery, employees);
    let recs = attendance;
    if (empId) recs = recs.filter((a) => a.empId === empId);
    if (date) recs = recs.filter((a) => a.date === date);
    return recs.slice(0, 200);
  }, [attendance, employees, empQuery, date]);

  function exportCsv() {
    const empId = resolveEmpId(empQuery, employees);
    let recs = attendance;
    if (empId) recs = recs.filter((a) => a.empId === empId);
    if (date) recs = recs.filter((a) => a.date === date);
    const rows: (string | number)[][] = [
      ["Date", "Employee", "Department", "Check-in", "Check-out", "Status"],
    ];
    for (const a of recs) {
      const e = empById.get(a.empId);
      if (e) rows.push([a.date, e.fullName, e.department, a.checkIn, a.checkOut, a.status]);
    }
    downloadCsv("attendance.csv", rows);
    toast("Exported attendance.csv", "success");
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="sub">View attendance across the organisation.</div>
        </div>
        <div className="toolbar">
          <input
            type="search"
            list="att-emp-list"
            placeholder="Search employee (or leave blank for all)"
            autoComplete="off"
            value={empQuery}
            onChange={(e) => setEmpQuery(e.target.value)}
          />
          <datalist id="att-emp-list">
            {employees.map((e) => (
              <option key={e.empId} value={`${e.fullName} (${e.empId})`} />
            ))}
          </datalist>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || today)}
          />
          <button className="btn btn-ghost" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((a) => {
                  const e = empById.get(a.empId);
                  if (!e) return null;
                  return (
                    <tr key={`${a.empId}-${a.date}`}>
                      <td>{fmtDate(a.date)}</td>
                      <td>{e.fullName}</td>
                      <td>{e.department}</td>
                      <td>{a.checkIn || "\u2014"}</td>
                      <td>{a.checkOut || "\u2014"}</td>
                      <td>
                        <Badge status={a.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="muted">
                    No records for this filter.
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
