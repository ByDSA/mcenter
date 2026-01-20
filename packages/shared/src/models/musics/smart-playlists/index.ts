import z from "zod";
import { mongoDbId } from "../../resources/partial-schemas";
import { autoTimestampsSchema } from "../../utils/schemas/timestamps";
import { userEntitySchema, userPublicSchema } from "../../auth";
import { imageCoverEntitySchema } from "../../image-covers";

export const musicSmartPlaylistSchema = z.object( {
  name: z.string().min(1),
  query: z.string().min(1),
  slug: z.string().min(1),
  ownerUserId: mongoDbId,
  visibility: z.enum(["private", "public"]).default("private"),
  imageCoverId: mongoDbId.nullable().optional(),
} );

export const musicSmartPlaylistEntitySchema = musicSmartPlaylistSchema
  .merge(autoTimestampsSchema)
  .extend( {
    id: mongoDbId,
    ownerUser: userEntitySchema.optional(),
    ownerUserPublic: userPublicSchema.optional(),
    imageCover: imageCoverEntitySchema.optional(),
  } );

export type MusicSmartPlaylistModel = z.infer<typeof musicSmartPlaylistSchema>;

export type MusicSmartPlaylistEntity = z.infer<typeof musicSmartPlaylistEntitySchema>;
