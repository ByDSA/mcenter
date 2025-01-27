import { z } from "zod";

export const searchSchema = z.object( {
  filter: z.object( {
    path: z.string().optional(),
  } ).strict()
    .optional(),
  sort: z.object( {} ).strict()
    .optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  expand: z.array(z.enum(["series"])).optional(),
} ).strict();
