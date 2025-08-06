import z from "zod";
import { dateSchema } from "./date";

export const timestampsFileSchema = z.object( {
  createdAt: dateSchema,
  updatedAt: dateSchema,
} ).strict();

export type TimestampsFileModel = z.infer<typeof timestampsFileSchema>;
