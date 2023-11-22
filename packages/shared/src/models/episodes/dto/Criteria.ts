/* eslint-disable import/prefer-default-export */
import { z } from "zod";

export const SearchSchema = z.object( {
  filter: z.object( {
    path: z.string().optional(),
  } ).strict()
    .optional(),
  sort: z.object( {
  } ).strict()
    .optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  expand: z.array(z.enum(["series"])).optional(),
} ).strict();