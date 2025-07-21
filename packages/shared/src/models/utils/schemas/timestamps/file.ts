import z from "zod";
import { dateSchema } from "./date";

export const timestampsFileSchema = z.object( {
  createdAt: dateSchema,
  updatedAt: dateSchema,
} ).strict();

export type TimestampsFileModel = z.infer<typeof timestampsFileSchema>;

export const timestampsFileDtoSchema = z.object( {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
} ).strict();

export type TimestampsFileDto = z.infer<typeof timestampsFileDtoSchema>;
