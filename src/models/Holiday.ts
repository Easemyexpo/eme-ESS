import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const HolidaySchema = new Schema(
  {
    date: { type: String, required: true, unique: true }, // ISO yyyy-mm-dd
    name: { type: String, required: true },
  },
  { timestamps: true },
);

export type HolidayDoc = InferSchemaType<typeof HolidaySchema>;

export const Holiday: Model<HolidayDoc> =
  (models.Holiday as Model<HolidayDoc>) || model<HolidayDoc>("Holiday", HolidaySchema);
