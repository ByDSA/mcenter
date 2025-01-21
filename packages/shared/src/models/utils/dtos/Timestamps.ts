/* eslint-disable import/prefer-default-export */
import z from "zod";

const DateSchema = z.date().or(z.string().transform((str) => new Date(str)));

export const TimestampsFileSchema = z.object( {
  createdAt: DateSchema,
  updatedAt: DateSchema,
} ).strict();

export const TimestampsSchema = z.object( {
  createdAt: DateSchema,
  updatedAt: DateSchema,
  addedAt: DateSchema,
} ).strict();

export type TimestampsModel = z.infer<typeof TimestampsSchema>;

export function compareTimestampsModel(a: TimestampsModel, b: TimestampsModel): boolean {
  const sameCreateaAt = a.createdAt.toString() === b.createdAt.toString();
  const sameUpdatedAt = a.updatedAt.toString() === b.updatedAt.toString();
  const sameAddedAt = a.addedAt.toString() === b.addedAt.toString();

  return sameCreateaAt && sameUpdatedAt && sameAddedAt;
}