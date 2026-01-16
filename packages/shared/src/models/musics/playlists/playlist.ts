import z from "zod";
import { imageCoverEntitySchema } from "../../../models/image-covers";
import { slugSchema } from "../../utils/schemas/slug";
import { dateSchema } from "../../utils/schemas/timestamps/date";
import { userEntitySchema, userPublicSchema } from "../../auth";
import { mongoDbId } from "../../resources/partial-schemas";
import { musicEntitySchema } from "../music";
import { autoTimestampsSchema } from "../../utils/schemas/timestamps";

const entrySchema = z.object( {
  id: mongoDbId,
  musicId: mongoDbId,
  addedAt: dateSchema,
} );

type EntryModel = z.infer<typeof entryEntitySchema>;
const entryEntitySchema = entrySchema.extend( {
  music: musicEntitySchema.optional(),
} );

type EntryEntity = z.infer<typeof entryEntitySchema>;
const modelSchema = z.object( {
  name: z.string(),
  list: z.array(entrySchema),
  slug: slugSchema,
  ownerUserId: mongoDbId,
  visibility: z.enum(["public", "private"]).default("private"),
  imageCoverId: mongoDbId.nullable().optional(),
} ).merge(autoTimestampsSchema);

type Model = z.infer<typeof modelSchema>;
const entitySchema = modelSchema.extend( {
  id: mongoDbId,
  ownerUser: userEntitySchema.optional(),
  ownerUserPublic: userPublicSchema.optional(),
  list: z.array(entryEntitySchema),
  imageCover: imageCoverEntitySchema.optional(),
} );

type Entity = z.infer<typeof entitySchema>;

export {
  Model as MusicPlaylist,
  Entity as MusicPlaylistEntity,
  EntryEntity as MusicPlaylistEntryEntity,
  EntryModel as MusicPlaylistEntry,
  modelSchema as musicPlaylistSchema,
  entitySchema as musicPlaylistEntitySchema,
};
