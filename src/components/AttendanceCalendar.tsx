"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApplyLeaveModal } from "@/components/ApplyLeaveModal";
import { useToast } from "@/components/ToastProvider";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { isWeeklyOff, monthName, fmtDate, fromIso, toIso } from "@/lib/dates";
import type { AttendanceDTO, HolidayDTO, LeaveBalanceDTO } from "@/types/dto";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function weeklyOffLabel(iso: string): string {
  return fromIso(iso).getDay() === 0 ? "Sunday (weekly off)" : "Weekend (2nd/4th Saturday)";
}

export function AttendanceCalendar({
  attendance,
  holidays,
  balances,
  today,
}: {
  attendance: AttendanceDTO[];
  holidays: HolidayDTO[];
  balances: LeaveBalanceDTO[];
  today: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const now = fromIso(today);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [applyDate, setApplyDate] = useState<string | null>(null);

  const attMap = useMemo(() => {
    const m = new Map<string, AttendanceDTO>();
    attendance.forEach((a) => m.set(a.date, a));
    return m;
  }, [attendance]);
  const holidayMap = useMemo(() => {
    const m = new Map<string, HolidayDTO>();
    holidays.forEach((h) => m.set(h.date, h));
    return m;
  }, [holidays]);

  function prevMonth() {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }
  function nextMonth() {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function check(kind: "in" | "out") {
    startTransition(async () => {
      const result = kind === "in" ? await checkInAction() : await checkOutAction();
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) router.refresh();
    });
  }

  function onDayClick(iso: string) {
    const holiday = holidayMap.get(iso);
    const weeklyOff = isWeeklyOff(iso);

    if (iso > today) {
      if (holiday) return toast(`${fmtDate(iso)} is a holiday (${holiday.name}).`, "info");
      if (weeklyOff) return toast(`${fmtDate(iso)} is a ${weeklyOffLabel(iso)}.`, "info");
      setApplyDate(iso);
      return;
    }
    if (iso < today) {
      if (holiday) return toast(`Holiday: ${holiday.name}`, "info");
      if (weeklyOff) return toast(weeklyOffLabel(iso), "info");
      const rec = attMap.get(iso);
      return toast(`${fmtDate(iso)}: ${rec ? rec.status : "No record"}`, "info");
    }
    // today
    if (holiday) return toast(`Today is a holiday (${holiday.name}) \u2014 no attendance needed.`, "info");
    if (weeklyOff) return toast(`Today is a ${weeklyOffLabel(iso)} \u2014 no attendance needed.`, "info");
    const rec = attMap.get(iso);
    if (rec?.status === "Leave") return toast("You are on approved leave today.", "info");
    if (!rec || !rec.checkIn) return check("in");
    if (!rec.checkOut) return check("out");
    return toast("Attendance already completed for today.", "info");
  }

  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startDow; i++) cells.push(<div className="cal-cell empty" key={`e${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toIso(new Date(year, month, d));
    const isToday = iso === today;
    const weeklyOff = isWeeklyOff(iso);
    const holiday = holidayMap.get(iso);
    const rec = attMap.get(iso);

    let chip: React.ReactNode = null;
    if (holiday) {
      chip = <div className="cal-status Holiday" title={holiday.name}>{holiday.name}</div>;
    } else if (rec) {
      const label = rec.status === "Half Day" ? "Half" : rec.status;
      chip = <div className={`cal-status ${rec.status === "Half Day" ? "Half" : rec.status}`}>{label}</div>;
    } else if (weeklyOff) {
      chip = <div className="cal-status Off">Off</div>;
    } else if (iso < today) {
      chip = <div className="cal-status Absent">Absent</div>;
    }

    let hint: React.ReactNode = null;
    if (isToday && !holiday && !weeklyOff && (!rec || rec.status !== "Leave")) {
      if (!rec || !rec.checkIn) hint = <div className="cal-mark-hint">Check in</div>;
      else if (!rec.checkOut) hint = <div className="cal-mark-hint">Check out</div>;
    }

    const cls = [
      "cal-cell",
      weeklyOff && !holiday ? "weekend" : "",
      holiday ? "holiday" : "",
      isToday ? "today" : "",
      "clickable",
    ]
      .filter(Boolean)
      .join(" ");

    cells.push(
      <div className={cls} key={iso} title={holiday ? holiday.name : ""} onClick={() => onDayClick(iso)}>
        <div className="cal-daynum">{d}</div>
        {chip}
        {hint}
      </div>,
    );
  }

  return (
    <>
      <div className="cal-wrap">
        <div className="cal-head">
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>
            &#8249;
          </button>
          <div className="cal-title">
            {monthName(month)} {year}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>
            &#8250;
          </button>
        </div>
        <div className="cal-grid">
          {DOW.map((d) => (
            <div className="cal-dow" key={d}>
              {d}
            </div>
          ))}
          {cells}
        </div>
      </div>
      {applyDate ? (
        <ApplyLeaveModal
          balances={balances}
          holidays={holidays}
          today={today}
          initialFrom={applyDate}
          onClose={() => setApplyDate(null)}
        />
      ) : null}
    </>
  );
}
