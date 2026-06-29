export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { StatCard } from "@/components/ui";
import { getEmployee } from "@/lib/data";
import { salaryBreakdown, formatINR } from "@/lib/money";

export default async function SalaryPage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin/payroll");

  const emp = await getEmployee(user.empId);
  if (!emp) notFound();

  const b = salaryBreakdown(emp.monthlyGross);
  const annual = (n: number) => formatINR(n * 12);

  const earnRow = (k: string, v: number) => (
    <tr key={k}>
      <td>{k}</td>
      <td className="amt">{formatINR(v)}</td>
      <td className="amt muted">{annual(v)}</td>
    </tr>
  );

  return (
    <>
      <div className="grid grid-3 section-gap">
        <StatCard color="green" ico={"\u20B9"} value={formatINR(b.gross * 12)} label="Annual CTC" />
        <StatCard color="indigo" ico={"\u20B9"} value={formatINR(b.gross)} label="Monthly gross" />
        <StatCard color="blue" ico={"\u20B9"} value={formatINR(b.net)} label="Monthly take-home" />
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Salary Breakdown</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            {emp.designation}
          </span>
        </div>
        <div className="card-pad">
          <div className="slip-cols">
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Earnings</div>
              <table className="slip-table">
                <tbody>
                  <tr className="slip-cap">
                    <td></td>
                    <td className="amt">Monthly</td>
                    <td className="amt">Annual</td>
                  </tr>
                  {earnRow("Basic", b.basic)}
                  {earnRow("HRA", b.hra)}
                  {earnRow("Special Allowance", b.special)}
                  <tr className="slip-total">
                    <td>Gross</td>
                    <td className="amt">{formatINR(b.gross)}</td>
                    <td className="amt">{annual(b.gross)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Deductions</div>
              <table className="slip-table">
                <tbody>
                  <tr className="slip-cap">
                    <td></td>
                    <td className="amt">Monthly</td>
                    <td className="amt">Annual</td>
                  </tr>
                  {earnRow("Provident Fund", b.pf)}
                  {earnRow("Income Tax (TDS)", b.tax)}
                  <tr className="slip-total">
                    <td>Total</td>
                    <td className="amt">{formatINR(b.deductions)}</td>
                    <td className="amt">{annual(b.deductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "var(--primary-soft)",
              borderRadius: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>Net Take-home</span>
            <span>
              <strong style={{ fontSize: 20, color: "var(--primary)" }}>{formatINR(b.net)}</strong>{" "}
              <span className="muted">
                / month {"\u00B7"} {formatINR(b.net * 12)} / year
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}