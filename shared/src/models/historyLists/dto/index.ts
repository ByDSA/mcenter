import { z } from "zod";

export const GetOneByIdSchema = z.object( {
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
export const GetManyEntriesBySuperIdSchema = GetOneByIdSchema.extend( {
  body: SearchSchema,
} ).required();
export const GetManyEntriesSchema = z.object( {
  body: SearchSchema,
} ).required();

export type GetOneByIdRequest = z.infer<typeof GetOneByIdSchema>;

export type GetManyBySuperIdRequest = z.infer<typeof GetManyEntriesBySuperIdSchema>;