import { Badge } from "@/components/ui";
import { initials } from "@/components/ui";
import { fmtDate } from "@/lib/dates";
import type { EmployeeDTO } from "@/types/dto";

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="info-item">
      <div className="k">{k}</div>
      <div className="v">{v || "\u2014"}</div>
    </div>
  );
}

/**
 * Read-only employee profile. Employees cannot edit their own records — all
 * fields are admin-maintained. Admins edit via the Employees screen.
 */
export function ProfileView({ emp, username }: { emp: EmployeeDTO; username: string }) {
  return (
    <>
      <div className="card section-gap">
        <div className="card-pad profile-head">
          <div className="avatar">{initials(emp.fullName)}</div>
          <div>
            <h3>{emp.fullName}</h3>
            <div className="muted">
              {emp.designation} {"\u00B7"} {emp.department}
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge status={emp.status} /> <span className="badge gray">{emp.empId}</span>{" "}
              <span className="badge indigo">{emp.employmentType}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Personal &amp; Contact</h3>
          </div>
          <div className="card-pad">
            <div className="info-grid">
              <Info k="Full Name" v={emp.fullName} />
              <Info k="Employee ID" v={emp.empId} />
              <Info k="Email" v={emp.email} />
              <Info k="Phone" v={emp.phone} />
              <Info k="Gender" v={emp.gender} />
              <Info k="Date of Birth" v={fmtDate(emp.dob)} />
              <Info k="Address" v={emp.address} />
              <Info k="Reporting Manager" v={emp.manager} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Employment</h3>
          </div>
          <div className="card-pad">
            <div className="info-grid">
              <Info k="Department" v={emp.department} />
              <Info k="Designation" v={emp.designation} />
              <Info k="Date of Joining" v={fmtDate(emp.doj)} />
              <Info k="Employment Type" v={emp.employmentType} />
              <Info k="Status" v={emp.status} />
              <Info k="Username" v={username} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Bank &amp; Statutory</h3>
          </div>
          <div className="card-pad">
            <div className="info-grid">
              <Info k="Bank Name" v={emp.bankName} />
              <Info k="Account Number" v={emp.bankAccount} />
              <Info k="IFSC" v={emp.ifsc} />
              <Info k="PAN" v={emp.pan} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
