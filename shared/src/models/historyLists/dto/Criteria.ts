/* eslint-disable import/prefer-default-export */
import { z } from "zod";

export const SearchSchema = z.object( {
  filter: z.object( {
    serieId: z.string().optional(),
    episodeId: z.string().optional(),
  } ).strict()
    .optional(),
  sort: z.object( {
    timestamp: z.enum(["asc", "desc"]).optional(),
  } ).strict()
    .optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  expand: z.array(z.enum(["series", "episodes"])).optional(),
} ).strict();