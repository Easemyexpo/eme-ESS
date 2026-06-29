"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";
import { saveHolidayAction, deleteHolidayAction } from "@/app/actions/holidays";
import { fmtDate, dowShort } from "@/lib/dates";
import type { HolidayDTO } from "@/types/dto";

function EditModal({
  holiday,
  year,
  onClose,
}: {
  holiday: HolidayDTO | null;
  year: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(holiday ? holiday.date : `${year}-01-01`);
  const [name, setName] = useState(holiday?.name ?? "");
  const [error, setError] = useState("");
  const isEdit = !!holiday;

  function save() {
    setError("");
    startTransition(async () => {
      const result = await saveHolidayAction({
        originalDate: holiday?.date,
        date,
        name,
      });
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
      title={isEdit ? "Edit Holiday" : "Add Holiday"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={pending} onClick={save}>
            {isEdit ? "Save" : "Add Holiday"}
          </button>
        </>
      }
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label>Holiday name</label>
        <input
          type="text"
          placeholder="e.g. Diwali"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error ? <div className="form-error">{error}</div> : null}
      </form>
    </Modal>
  );
}

function DeleteModal({
  holiday,
  onClose,
}: {
  holiday: HolidayDTO;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await deleteHolidayAction(holiday.date);
      toast(result.message, result.ok ? "info" : "error");
      if (result.ok) {
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <Modal
      title="Delete Holiday"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" disabled={pending} onClick={remove}>
            Delete
          </button>
        </>
      }
    >
      <p>
        Remove <strong>{holiday.name}</strong> on {fmtDate(holiday.date)}? This date will become a
        normal working day.
      </p>
    </Modal>
  );
}

export function HolidayManager({ holidays }: { holidays: HolidayDTO[] }) {
  const years = useMemo(() => {
    const set = new Set(holidays.map((h) => Number(h.date.slice(0, 4))));
    const cur = new Date().getFullYear();
    set.add(cur);
    set.add(cur + 1);
    return Array.from(set).sort((a, b) => a - b);
  }, [holidays]);

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [editing, setEditing] = useState<{ kind: "add" } | { kind: "edit"; holiday: HolidayDTO } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<HolidayDTO | null>(null);

  const list = useMemo(
    () =>
      holidays
        .filter((h) => h.date.startsWith(`${year}-`))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [holidays, year],
  );

  return (
    <>
      <div className="page-head">
        <div>
          <div className="sub">
            Manage public holidays. These appear on every employee&apos;s calendar and lock
            attendance.
          </div>
        </div>
        <div className="toolbar">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setEditing({ kind: "add" })}>
            + Add Holiday
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Holiday</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length ? (
                list.map((h) => (
                  <tr key={h.date}>
                    <td>{fmtDate(h.date)}</td>
                    <td>{dowShort(h.date)}</td>
                    <td>{h.name}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-sm btn-soft"
                          onClick={() => setEditing({ kind: "edit", holiday: h })}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleting(h)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="muted">
                    No holidays defined for {year}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <EditModal
          holiday={editing.kind === "edit" ? editing.holiday : null}
          year={year}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {deleting ? <DeleteModal holiday={deleting} onClose={() => setDeleting(null)} /> : null}
    </>
  );
}
