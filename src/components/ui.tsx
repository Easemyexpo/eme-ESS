import type { ReactNode } from "react";
import { badgeClass } from "@/lib/badges";

export function Badge({ status }: { status: string }) {
  return <span className={badgeClass(status)}>{status}</span>;
}

export function StatusOrGray({ status }: { status?: string | null }) {
  if (!status) return <span className="badge gray">Not marked</span>;
  return <Badge status={status} />;
}

export function StatCard({
  color,
  ico,
  value,
  label,
}: {
  color: "indigo" | "blue" | "amber" | "green" | "red";
  ico: ReactNode;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="card stat">
      <div className={`stat-ico ${color}`}>{ico}</div>
      <div className="stat-meta">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/** Two-letter initials from a person's name. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
