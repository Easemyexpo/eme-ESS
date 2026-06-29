import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const AttendanceSchema = new Schema(
  {
    empId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // ISO yyyy-mm-dd
    status: {
      type: String,
      enum: ["Present", "Late", "Half Day", "Leave", "Absent"],
      required: true,
    },
    checkIn: { type: String, default: "" }, // HH:MM
    checkOut: { type: String, default: "" }, // HH:MM
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

AttendanceSchema.index({ empId: 1, date: 1 }, { unique: true });

export type AttendanceDoc = InferSchemaType<typeof AttendanceSchema>;

export const Attendance: Model<AttendanceDoc> =
  (models.Attendance as Model<AttendanceDoc>) ||
  model<AttendanceDoc>("Attendance", AttendanceSchema);
