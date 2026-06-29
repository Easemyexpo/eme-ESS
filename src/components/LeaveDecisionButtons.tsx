"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideLeaveAction } from "@/app/actions/leave";
import { useToast } from "@/components/ToastProvider";

export function LeaveDecisionButtons({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function decide(decision: "Approved" | "Rejected") {
    startTransition(async () => {
      const result = await decideLeaveAction({ id, decision });
      toast(result.message, result.ok ? (decision === "Approved" ? "success" : "info") : "error");
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="row-actions">
      <button className="btn btn-sm btn-success" disabled={pending} onClick={() => decide("Approved")}>
        Approve
      </button>
      <button className="btn btn-sm btn-danger" disabled={pending} onClick={() => decide("Rejected")}>
        Reject
      </button>
    </div>
  );
}
