import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const LeaveRequestSchema = new Schema(
  {
    empId: { type: String, required: true, index: true },
    code: { type: String, required: true }, // leave type code: EL/SL
    from: { type: String, required: true }, // ISO yyyy-mm-dd
    to: { type: String, required: true }, // ISO yyyy-mm-dd
    days: { type: Number, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    appliedOn: { type: String, required: true },
    decidedBy: { type: String, default: "" },
    decidedOn: { type: String, default: "" },
  },
  { timestamps: true },
);

export type LeaveRequestDoc = InferSchemaType<typeof LeaveRequestSchema>;

export const LeaveRequest: Model<LeaveRequestDoc> =
  (models.LeaveRequest as Model<LeaveRequestDoc>) ||
  model<LeaveRequestDoc>("LeaveRequest", LeaveRequestSchema);
