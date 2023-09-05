import { validateRequest } from "#utils/validation/zod-express";
import { z } from "zod";

const getOneByIdSchema = z.object( {
  params: z.object( {
    id: z.string( {
      required_error: "id is required",
    } ),
  } ),
} );
const SearchSchema = z.object( {
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
const getManyEntriesBySuperIdSchema = getOneByIdSchema.extend( {
  body: SearchSchema,
} ).required();
const getManyEntriesSchema = z.object( {
  body: SearchSchema,
} ).required();

export type GetOneByIdRequest = z.infer<typeof getOneByIdSchema>;

export type GetManyBySuperIdRequest = z.infer<typeof getManyEntriesBySuperIdSchema>;

export const getOneByIdValidation = validateRequest(getOneByIdSchema);

export const getManyEntriesBySuperIdValidation = validateRequest(getManyEntriesBySuperIdSchema);

export const getManyEntriesValidation = validateRequest(getManyEntriesSchema);