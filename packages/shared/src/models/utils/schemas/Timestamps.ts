import z from "zod";

const dateSchema = z.date().or(z.string().transform((str) => new Date(str)));

export const timestampsFileSchema = z.object( {
  createdAt: dateSchema,
  updatedAt: dateSchema,
} ).strict();

export const timestampsSchema = z.object( {
  createdAt: dateSchema,
  updatedAt: dateSchema,
  addedAt: dateSchema,
} ).strict();

export type TimestampsModel = z.infer<typeof timestampsSchema>;

export function compareTimestampsModel(a: TimestampsModel, b: TimestampsModel): boolean {
  const sameCreateaAt = a.createdAt.toString() === b.createdAt.toString();
  const sameUpdatedAt = a.updatedAt.toString() === b.updatedAt.toString();
  const sameAddedAt = a.addedAt.toString() === b.addedAt.toString();

  return sameCreateaAt && sameUpdatedAt && sameAddedAt;
}

export const timestampsDtoSchema = z.object( {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  addedAt: z.string().datetime(),
} ).strict();

export type TimestampsDto = z.infer<typeof timestampsDtoSchema>;
