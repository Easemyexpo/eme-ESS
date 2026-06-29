import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const PayslipSchema = new Schema(
  {
    empId: { type: String, required: true, index: true },
    month: { type: Number, required: true }, // 0-11
    year: { type: Number, required: true },
    label: { type: String, required: true }, // e.g. "June 2026"
    basic: { type: Number, required: true },
    hra: { type: Number, required: true },
    special: { type: Number, required: true },
    gross: { type: Number, required: true },
    pf: { type: Number, required: true },
    tax: { type: Number, required: true },
    deductions: { type: Number, required: true },
    net: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
    paidOn: { type: String, default: "" },
  },
  { timestamps: true },
);

PayslipSchema.index({ empId: 1, year: 1, month: 1 }, { unique: true });

export type PayslipDoc = InferSchemaType<typeof PayslipSchema>;

export const Payslip: Model<PayslipDoc> =
  (models.Payslip as Model<PayslipDoc>) || model<PayslipDoc>("Payslip", PayslipSchema);
