"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";
import { adjustBalancesAction } from "@/app/actions/balances";
import { LEAVE_TYPES } from "@/lib/constants";
import type { EmployeeDTO, LeaveBalanceDTO } from "@/types/dto";

type Code = "EL" | "SL";

function rowFor(balances: LeaveBalanceDTO[], empId: string, code: string) {
  return balances.find((b) => b.empId === empId && b.code === code) ?? { total: 0, used: 0 };
}

function AdjustModal({
  employee,
  balances,
  onClose,
}: {
  employee: EmployeeDTO;
  balances: LeaveBalanceDTO[];
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(() =>
    LEAVE_TYPES.map((t) => {
      const b = rowFor(balances, employee.empId, t.code);
      return { code: t.code as Code, name: t.name, total: b.total, used: b.used };
    }),
  );

  function update(code: Code, field: "total" | "used", value: number) {
    setDraft((d) =>
      d.map((row) => (row.code === code ? { ...row, [field]: Math.max(0, value || 0) } : row)),
    );
  }

  function save() {
    startTransition(async () => {
      const result = await adjustBalancesAction({
        empId: employee.empId,
        balances: draft.map(({ code, total, used }) => ({ code, total, used })),
      });
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) {
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <Modal
      title={`Adjust Balances \u00B7 ${employee.fullName}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={pending} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <form onSubmit={(e) => e.preventDefault()}>
        {draft.map((row) => (
          <div className="form-row-3" style={{ alignItems: "end" }} key={row.code}>
            <div>
              <label>{row.name} {"\u2014"} Total</label>
              <input
                type="number"
                min={0}
                value={row.total}
                onChange={(e) => update(row.code, "total", Number(e.target.value))}
              />
            </div>
            <div>
              <label>Used</label>
              <input
                type="number"
                min={0}
                value={row.used}
                onChange={(e) => update(row.code, "used", Number(e.target.value))}
              />
            </div>
            <div className="kv" style={{ paddingBottom: 9 }}>
              <span className="muted">Available</span>
              <strong>{row.total - row.used}</strong>
            </div>
          </div>
        ))}
      </form>
    </Modal>
  );
}

export function BalanceManager({
  employees,
  balances,
}: {
  employees: EmployeeDTO[];
  balances: LeaveBalanceDTO[];
}) {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<EmployeeDTO | null>(null);

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
                {LEAVE_TYPES.map((t) => (
                  <th key={t.code}>{t.name} (avail / total)</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((e) => (
                  <tr key={e.empId}>
                    <td>
                      {e.fullName}{" "}
                      <span className="muted" style={{ fontSize: 12 }}>
                        ({e.empId})
                      </span>
                    </td>
                    {LEAVE_TYPES.map((t) => {
                      const b = rowFor(balances, e.empId, t.code);
                      return (
                        <td key={t.code}>
                          <strong>{b.total - b.used}</strong> / {b.total}
                        </td>
                      );
                    })}
                    <td>
                      <button className="btn btn-sm btn-soft" onClick={() => setTarget(e)}>
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={LEAVE_TYPES.length + 2} className="muted">
                    No employees match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {target ? (
        <AdjustModal employee={target} balances={balances} onClose={() => setTarget(null)} />
      ) : null}
    </>
  );
}
