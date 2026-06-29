"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { useToast } from "@/components/ToastProvider";
import { workedDuration } from "@/lib/dates";
import type { AttendanceDTO } from "@/types/dto";

/**
 * Compact "today's attendance" strip with inline check-in → check-out times and
 * a single contextual action button (Razorpay-style), shared by the employee
 * dashboard and attendance page.
 */
export function TodayPanel({ today }: { today: AttendanceDTO | null }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  if (today?.status === "Leave") {
    return (
      <div className="empty-state" style={{ padding: 18 }}>
        <div className="big">{"\u{1F3D6}"}</div>
        You are on approved leave today.
      </div>
    );
  }

  const checkedIn = Boolean(today?.checkIn);
  const checkedOut = Boolean(today?.checkOut);
  const worked = checkedIn && checkedOut ? workedDuration(today!.checkIn, today!.checkOut) : "";
  const note = worked ? `${worked} worked today` : checkedIn ? "Clocked in" : "Not checked in yet";

  function run(kind: "in" | "out") {
    startTransition(async () => {
      const result = kind === "in" ? await checkInAction() : await checkOutAction();
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="attn-strip">
      <div className="attn-strip-times">
        <span className="attn-pair">
          <b className={checkedIn ? "" : "muted"}>{checkedIn ? today!.checkIn : "--:--"}</b>
          <small>Check-in</small>
        </span>
        <span className="attn-arrow">{"\u2192"}</span>
        <span className="attn-pair">
          <b className={checkedOut ? "" : "muted"}>{checkedOut ? today!.checkOut : "--:--"}</b>
          <small>Check-out</small>
        </span>
      </div>
      <div className="attn-strip-side">
        <span className="attn-strip-note">{note}</span>
        {!checkedIn ? (
          <button className="btn btn-primary btn-sm" disabled={pending} onClick={() => run("in")}>
            Check In
          </button>
        ) : !checkedOut ? (
          <button className="btn btn-success btn-sm" disabled={pending} onClick={() => run("out")}>
            Check Out
          </button>
        ) : (
          <span className="badge green">Completed</span>
        )}
      </div>
    </div>
  );
}
