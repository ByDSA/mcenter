import z from "zod";
import { mongoDbId } from "../../resources/partial-schemas";
import { autoTimestampsSchema } from "../../utils/schemas/timestamps";
import { userEntitySchema, userPublicSchema } from "../../auth";
import { imageCoverEntitySchema } from "../../image-covers";

export const musicQuerySchema = z.object( {
  name: z.string().min(1),
  query: z.string().min(1),
  slug: z.string().min(1),
  ownerUserId: mongoDbId,
  visibility: z.enum(["private", "public"]).default("private"),
  imageCoverId: mongoDbId.nullable().optional(),
} );

export const musicQueryEntitySchema = musicQuerySchema
  .merge(autoTimestampsSchema)
  .extend( {
    id: mongoDbId,
    ownerUser: userEntitySchema.optional(),
    ownerUserPublic: userPublicSchema.optional(),
    imageCover: imageCoverEntitySchema.optional(),
  } );

export type MusicQueryModel = z.infer<typeof musicQuerySchema>;

export type MusicQueryEntity = z.infer<typeof musicQueryEntitySchema>;
