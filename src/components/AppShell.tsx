"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { initials } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  ico: string;
  badge?: number;
}

const EMP_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", ico: "\u25A6" },
  { href: "/attendance", label: "Attendance", ico: "\u23F1" },
  { href: "/leave", label: "Leave", ico: "\u2708" },
  { href: "/salary", label: "Salary", ico: "\u20B9" },
  { href: "/profile", label: "My Profile", ico: "\u263A" },
];

function adminNav(pending: number): NavItem[] {
  return [
    { href: "/dashboard", label: "Dashboard", ico: "\u25A6" },
    { href: "/admin/employees", label: "Employees", ico: "\u263B" },
    { href: "/admin/attendance", label: "Attendance", ico: "\u23F1" },
    { href: "/admin/leave", label: "Leave Requests", ico: "\u2708", badge: pending },
    { href: "/admin/balances", label: "Leave Balances", ico: "\u2696" },
    { href: "/admin/holidays", label: "Holidays", ico: "\u2691" },
    { href: "/admin/payroll", label: "Payroll", ico: "\u20B9" },
  ];
}

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/attendance": "Attendance",
  "/leave": "Leave Management",
  "/salary": "Salary & Payslips",
  "/profile": "My Profile",
  "/admin/employees": "Employee Management",
  "/admin/attendance": "Attendance Monitor",
  "/admin/leave": "Leave Requests",
  "/admin/balances": "Leave Balances",
  "/admin/holidays": "Holiday Calendar",
  "/admin/payroll": "Payroll Management",
};

export function AppShell({
  role,
  fullName,
  roleLabel,
  todayLong,
  pendingLeaves,
  children,
}: {
  role: Role;
  fullName: string;
  roleLabel: string;
  todayLong: string;
  pendingLeaves: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = role === "admin" ? adminNav(pendingLeaves) : EMP_NAV;
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <div className="app-shell">
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-head">
          <div className="logo-badge">
            <Image className="logo-img" src="/logo.jpeg" alt={APP_NAME} width={36} height={36} />
          </div>
          <span className="sidebar-title">{APP_NAME}</span>
        </div>
        <nav className="nav-menu">
          <div className="nav-section-label">
            {role === "admin" ? "Administration" : "Self-Service"}
          </div>
          {items.map((i) => {
            const active = pathname === i.href;
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`nav-item${active ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="nav-ico">{i.ico}</span>
                <span className="nav-label">{i.label}</span>
                {i.badge ? <span className="nav-badge">{i.badge}</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{initials(fullName)}</div>
            <div className="user-chip-meta">
              <div className="user-chip-name">{fullName}</div>
              <div className="user-chip-role muted">{roleLabel}</div>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost btn-block">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            &#9776;
          </button>
          <h2>{title}</h2>
          <div className="topbar-right">
            <span className="muted">{todayLong}</span>
          </div>
        </header>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
