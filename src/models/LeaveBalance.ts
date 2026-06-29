import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const LeaveBalanceSchema = new Schema(
  {
    empId: { type: String, required: true, index: true },
    code: { type: String, required: true }, // EL/SL
    total: { type: Number, required: true },
    used: { type: Number, default: 0 },
  },
  { timestamps: true },
);

LeaveBalanceSchema.index({ empId: 1, code: 1 }, { unique: true });

export type LeaveBalanceDoc = InferSchemaType<typeof LeaveBalanceSchema>;

export const LeaveBalance: Model<LeaveBalanceDoc> =
  (models.LeaveBalance as Model<LeaveBalanceDoc>) ||
  model<LeaveBalanceDoc>("LeaveBalance", LeaveBalanceSchema);
