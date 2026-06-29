"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";
import { applyLeaveAction } from "@/app/actions/leave";
import { workingDays, fromIso } from "@/lib/dates";
import { LEAVE_TYPES } from "@/lib/constants";
import type { HolidayDTO, LeaveBalanceDTO } from "@/types/dto";

export function ApplyLeaveModal({
  balances,
  holidays,
  today,
  initialFrom,
  onClose,
}: {
  balances: LeaveBalanceDTO[];
  holidays: HolidayDTO[];
  today: string;
  initialFrom?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const start = initialFrom && initialFrom >= today ? initialFrom : today;
  const [code, setCode] = useState<string>(LEAVE_TYPES[0].code);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(start);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const holidaySet = useMemo(() => new Set(holidays.map((h) => h.date)), [holidays]);
  const days = useMemo(() => {
    if (!from || !to || fromIso(to) < fromIso(from)) return 0;
    return workingDays(from, to, holidaySet);
  }, [from, to, holidaySet]);

  function availFor(c: string): number {
    const b = balances.find((x) => x.code === c);
    return b ? b.total - b.used : 0;
  }

  function submit() {
    setError("");
    if (!from || !to) return setError("Please choose dates.");
    if (fromIso(to) < fromIso(from)) return setError("End date can't be before start date.");
    if (days < 1) return setError("Selected range has no working days.");
    if (!reason.trim()) return setError("Please provide a reason.");
    if (days > availFor(code)) return setError(`Insufficient balance. Only ${availFor(code)} day(s) left.`);

    startTransition(async () => {
      const result = await applyLeaveAction({ code, from, to, reason: reason.trim() });
      if (result.ok) {
        toast(result.message, "success");
        onClose();
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Modal
      title="Apply for Leave"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={pending} onClick={submit}>
            {pending ? "Submitting…" : "Submit Request"}
          </button>
        </>
      }
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <label>Leave Type</label>
        <select value={code} onChange={(e) => setCode(e.target.value)}>
          {LEAVE_TYPES.map((t) => (
            <option key={t.code} value={t.code}>
              {t.name} ({availFor(t.code)} left)
            </option>
          ))}
        </select>
        <div className="form-row">
          <div>
            <label>From</label>
            <input type="date" value={from} min={today} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label>To</label>
            <input type="date" value={to} min={today} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="kv" style={{ marginTop: 10 }}>
          <span className="muted">Working days requested</span>
          <strong>{days}</strong>
        </div>
        <label>Reason</label>
        <textarea
          placeholder="Brief reason for your leave..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error ? <div className="form-error">{error}</div> : null}
      </form>
    </Modal>
  );
}
