import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Atomic sequence generator used to mint monotonic IDs (e.g. employee codes
 * "EMP006"). Using `findOneAndUpdate` with `$inc` and `upsert` guarantees no
 * two concurrent requests receive the same number.
 */
const CounterSchema = new Schema({
  _id: { type: String, required: true }, // sequence name, e.g. "empId"
  seq: { type: Number, required: true, default: 0 },
});

export type CounterDoc = InferSchemaType<typeof CounterSchema>;

export const Counter: Model<CounterDoc> =
  (models.Counter as Model<CounterDoc>) || model<CounterDoc>("Counter", CounterSchema);

export async function nextSequence(name: string): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean();
  return doc!.seq;
}
