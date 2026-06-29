import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const EmployeeSchema = new Schema(
  {
    empId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    address: { type: String, default: "" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    manager: { type: String, default: "" },
    doj: { type: String, default: "" },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Intern"],
      default: "Full-time",
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    bankName: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    pan: { type: String, default: "" },
    monthlyGross: { type: Number, default: 60000 },
  },
  { timestamps: true },
);

export type EmployeeDoc = InferSchemaType<typeof EmployeeSchema>;

export const Employee: Model<EmployeeDoc> =
  (models.Employee as Model<EmployeeDoc>) || model<EmployeeDoc>("Employee", EmployeeSchema);
