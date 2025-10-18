import z from "zod";
import { dateSchema } from "./date";

export const autoTimestampsSchema = z.object( {
  createdAt: dateSchema,
  updatedAt: dateSchema,
} ).strict();

export const nonAutoTimestampsSchema = z.object( {
  addedAt: dateSchema,
  releasedOn: z.string().optional(),
} ).strict();

export const timestampsSchema = autoTimestampsSchema.merge(nonAutoTimestampsSchema);

export type TimestampsModel = z.infer<typeof timestampsSchema>;

export function compareTimestampsModel(a: TimestampsModel, b: TimestampsModel): boolean {
  const sameCreateaAt = a.createdAt.toString() === b.createdAt.toString();
  const sameUpdatedAt = a.updatedAt.toString() === b.updatedAt.toString();
  const sameAddedAt = a.addedAt.toString() === b.addedAt.toString();
  const sameReleasedOn = a.releasedOn === b.releasedOn;

  return sameCreateaAt && sameUpdatedAt && sameAddedAt && sameReleasedOn;
}

export const timestampsDtoSchema = z.object( {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  addedAt: z.string().datetime(),
  releasedOn: z.string().optional(),
} ).strict();

export type TimestampsDto = z.infer<typeof timestampsDtoSchema>;
