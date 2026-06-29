"use client";

import { useState } from "react";
import { ApplyLeaveModal } from "@/components/ApplyLeaveModal";
import type { HolidayDTO, LeaveBalanceDTO } from "@/types/dto";

export function ApplyLeaveButton({
  balances,
  holidays,
  today,
}: {
  balances: LeaveBalanceDTO[];
  holidays: HolidayDTO[];
  today: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + Apply for Leave
      </button>
      {open ? (
        <ApplyLeaveModal
          balances={balances}
          holidays={holidays}
          today={today}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
