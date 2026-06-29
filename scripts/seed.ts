/**
 * Database seed — clean install.
 *
 *   npm run seed
 *
 * Loads env from `.env.local`, connects to MONGODB_URI, wipes ALL portal
 * collections, and creates a single administrator account. No demo employees,
 * attendance, leave, holidays, or payroll are created — start from a clean slate
 * and add real employees through the admin UI.
 *
 * Admin login:  admin / admin123
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { dbConnect } from "../src/lib/mongodb";
import {
  User,
  Employee,
  Attendance,
  LeaveRequest,
  LeaveBalance,
  Holiday,
  Payslip,
  Counter,
} from "../src/models";
import { LEAVE_TYPES } from "../src/lib/constants";

async function seed() {
  await dbConnect();
  console.log("Connected. Clearing all portal data…");

  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Attendance.deleteMany({}),
    LeaveRequest.deleteMany({}),
    LeaveBalance.deleteMany({}),
    Holiday.deleteMany({}),
    Payslip.deleteMany({}),
    Counter.deleteMany({}),
  ]);
  console.log("All collections cleared.");

  // Single administrator account. Fill in the real details via the admin UI.
  const ADMIN_EMP_ID = "EMP000";

  await Employee.create({
    empId: ADMIN_EMP_ID,
    fullName: "Administrator",
    email: "admin@easemyexpo.com",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    department: "Human Resources",
    designation: "Administrator",
    manager: "",
    doj: "",
    employmentType: "Full-time",
    status: "Active",
    bankName: "",
    bankAccount: "",
    ifsc: "",
    pan: "",
    monthlyGross: 0,
  });

  await User.create({
    username: "admin",
    passwordHash: await bcrypt.hash("admin123", 10),
    role: "admin",
    empId: ADMIN_EMP_ID,
  });

  await LeaveBalance.insertMany(
    LEAVE_TYPES.map((t) => ({ empId: ADMIN_EMP_ID, code: t.code, total: t.total, used: 0 })),
  );

  // Employee-id sequence starts at 0 → first employee added via the UI is EMP001.
  await Counter.findByIdAndUpdate("empId", { seq: 0 }, { upsert: true });

  console.log("\n✅ Seed complete — clean database.");
  console.log("   Admin login: admin / admin123");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
