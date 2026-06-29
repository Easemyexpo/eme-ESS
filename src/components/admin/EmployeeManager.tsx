"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { Badge, initials } from "@/components/ui";
import { EmployeeFormModal } from "@/components/admin/EmployeeFormModal";
import { fmtDate } from "@/lib/dates";
import type { EmployeeDTO, UserDTO } from "@/types/dto";

type Mode =
  | { kind: "add" }
  | { kind: "edit"; emp: EmployeeDTO }
  | { kind: "view"; emp: EmployeeDTO }
  | null;

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="info-item">
      <div className="k">{k}</div>
      <div className="v">{v || "\u2014"}</div>
    </div>
  );
}

export function EmployeeManager({
  employees,
  users,
}: {
  employees: EmployeeDTO[];
  users: UserDTO[];
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>(null);

  const userByEmp = useMemo(() => {
    const map = new Map<string, UserDTO>();
    for (const u of users) map.set(u.empId, u);
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.empId.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    );
  }, [employees, query]);

  const account = mode && "emp" in mode ? userByEmp.get(mode.emp.empId) ?? null : null;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="sub">Manage accounts, profiles and employment details.</div>
        </div>
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search name, ID, dept..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setMode({ kind: "add" })}>
            + Add Employee
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Login</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((e) => {
                  const u = userByEmp.get(e.empId);
                  return (
                    <tr key={e.empId}>
                      <td>{e.empId}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                            {initials(e.fullName)}
                          </div>
                          {e.fullName}
                        </div>
                      </td>
                      <td>{e.department}</td>
                      <td>{e.designation}</td>
                      <td>{fmtDate(e.doj)}</td>
                      <td>
                        <Badge status={e.status} />
                      </td>
                      <td>
                        {u ? (
                          <span className={`badge ${u.role === "admin" ? "indigo" : "gray"}`}>
                            {u.username}
                          </span>
                        ) : (
                          <span className="muted">{"\u2014"}</span>
                        )}
                      </td>
                      <td className="row-actions">
                        <button
                          className="btn btn-sm btn-soft"
                          onClick={() => setMode({ kind: "view", emp: e })}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => setMode({ kind: "edit", emp: e })}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="muted">
                    No employees match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode?.kind === "view" ? (
        <Modal
          title={`${mode.emp.fullName} \u00B7 ${mode.emp.empId}`}
          size="lg"
          onClose={() => setMode(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setMode(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setMode({ kind: "edit", emp: mode.emp })}
              >
                Edit Record
              </button>
            </>
          }
        >
          <div className="profile-head" style={{ marginBottom: 16 }}>
            <div className="avatar" style={{ width: 60, height: 60, fontSize: 20 }}>
              {initials(mode.emp.fullName)}
            </div>
            <div>
              <h3>{mode.emp.fullName}</h3>
              <div className="muted">
                {mode.emp.designation} {"\u00B7"} {mode.emp.department}
              </div>
              <div style={{ marginTop: 6 }}>
                <Badge status={mode.emp.status} />{" "}
                <span className="badge gray">{mode.emp.empId}</span>
              </div>
            </div>
          </div>
          <div className="info-grid">
            <Info k="Email" v={mode.emp.email} />
            <Info k="Phone" v={mode.emp.phone} />
            <Info k="Date of Joining" v={fmtDate(mode.emp.doj)} />
            <Info k="Reporting Manager" v={mode.emp.manager} />
            <Info k="Bank" v={mode.emp.bankName} />
            <Info k="Account" v={mode.emp.bankAccount} />
            <Info k="IFSC" v={mode.emp.ifsc} />
            <Info k="PAN" v={mode.emp.pan} />
            <Info k="Login" v={account?.username ?? ""} />
            <Info k="Role" v={account?.role ?? ""} />
          </div>
        </Modal>
      ) : null}

      {mode?.kind === "add" || mode?.kind === "edit" ? (
        <EmployeeFormModal
          employee={mode.kind === "edit" ? mode.emp : null}
          account={mode.kind === "edit" ? account : null}
          onClose={() => setMode(null)}
        />
      ) : null}
    </>
  );
}
