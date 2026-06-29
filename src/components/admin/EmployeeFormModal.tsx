"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";
import {
  createEmployeeAction,
  updateEmployeeAction,
  deleteEmployeeAction,
} from "@/app/actions/employee";
import { formatINR } from "@/lib/money";
import { todayIso } from "@/lib/dates";
import type { EmployeeDTO, UserDTO } from "@/types/dto";

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Sales",
  "Finance",
  "Human Resources",
  "Marketing",
  "Operations",
];
const GENDERS = ["Female", "Male", "Other"];
const TYPES = ["Full-time", "Part-time", "Contract", "Intern"];
const STATUSES = ["Active", "Inactive"];

function emptyEmployee(): EmployeeDTO {
  return {
    empId: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "Female",
    dob: "",
    address: "",
    department: "Engineering",
    designation: "",
    manager: "",
    doj: todayIso(),
    employmentType: "Full-time",
    status: "Active",
    bankName: "",
    bankAccount: "",
    ifsc: "",
    pan: "",
    monthlyGross: 60000,
  };
}

export function EmployeeFormModal({
  employee,
  account,
  onClose,
}: {
  employee: EmployeeDTO | null;
  account: UserDTO | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const isNew = !employee;
  const base = employee ?? emptyEmployee();

  const [form, setForm] = useState({ ...base });
  const [username, setUsername] = useState(account?.username ?? "");
  const [password, setPassword] = useState(account ? "" : "pass123");
  const [role, setRole] = useState<UserDTO["role"]>(account?.role ?? "employee");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function set<K extends keyof EmployeeDTO>(key: K, value: EmployeeDTO[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    setError("");
    if (!form.fullName.trim()) return setError("Name is required.");

    const payload = {
      ...form,
      empId: isNew ? undefined : form.empId,
      monthlyGross: form.monthlyGross,
      username: username.trim(),
      password,
      role,
    };

    startTransition(async () => {
      const result = isNew
        ? await createEmployeeAction(payload)
        : await updateEmployeeAction(payload);
      if (result.ok) {
        toast(result.message, "success");
        onClose();
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  function doDelete() {
    if (!employee) return;
    startTransition(async () => {
      const result = await deleteEmployeeAction(employee.empId);
      toast(result.message, result.ok ? "info" : "error");
      if (result.ok) {
        onClose();
        router.refresh();
      } else {
        setConfirmDelete(false);
        setError(result.message);
      }
    });
  }

  if (confirmDelete && employee) {
    return (
      <Modal
        title="Delete employee?"
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" disabled={pending} onClick={doDelete}>
              Confirm
            </button>
          </>
        }
      >
        <p>
          This removes {employee.fullName}, their login, attendance, leave and payroll records. This
          cannot be undone.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={isNew ? "Add Employee" : `Edit ${base.fullName}`}
      size="lg"
      onClose={onClose}
      footer={
        <>
          {!isNew ? (
            <button
              className="btn btn-danger"
              style={{ marginRight: "auto" }}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          ) : null}
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={pending} onClick={submit}>
            {isNew ? "Create Employee" : "Save Changes"}
          </button>
        </>
      }
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-row">
          <div>
            <label>Full Name</label>
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </div>
          <div>
            <label>Employee ID</label>
            <input value={isNew ? "Auto-assigned on save" : form.empId} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
        <div className="form-row-3">
          <div>
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Date of Birth</label>
            <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          </div>
          <div>
            <label>Date of Joining</label>
            <input type="date" value={form.doj} onChange={(e) => set("doj", e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Department</label>
            <select value={form.department} onChange={(e) => set("department", e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Designation</label>
            <input value={form.designation} onChange={(e) => set("designation", e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Reporting Manager</label>
            <input value={form.manager} onChange={(e) => set("manager", e.target.value)} />
          </div>
          <div>
            <label>Employment Type</label>
            <select
              value={form.employmentType}
              onChange={(e) => set("employmentType", e.target.value as EmployeeDTO["employmentType"])}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <label>Address</label>
        <textarea value={form.address} onChange={(e) => set("address", e.target.value)} />

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--border)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Compensation</div>
          <div className="form-row">
            <div>
              <label>Monthly Gross ({"\u20B9"})</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.monthlyGross}
                onChange={(e) => set("monthlyGross", Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div>
              <label>Annual CTC</label>
              <input type="text" value={formatINR((form.monthlyGross || 0) * 12)} readOnly />
            </div>
          </div>
        </div>

        <div className="form-row-3">
          <div>
            <label>Bank Name</label>
            <input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} />
          </div>
          <div>
            <label>Account No.</label>
            <input value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} />
          </div>
          <div>
            <label>IFSC</label>
            <input value={form.ifsc} onChange={(e) => set("ifsc", e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>PAN</label>
            <input value={form.pan} onChange={(e) => set("pan", e.target.value)} />
          </div>
          <div>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as EmployeeDTO["status"])}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--border)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Login Account</div>
          <div className="form-row-3">
            <div>
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label>Password</label>
              <input
                value={password}
                placeholder={account ? "Leave blank to keep" : ""}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as UserDTO["role"])}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {error ? <div className="form-error">{error}</div> : null}
      </form>
    </Modal>
  );
}
