import z from "zod";
import { mongoDbId } from "../../../models/resources/partial-schemas";
import { musicPlaylistEntitySchema } from "../playlists";
import { musicSmartPlaylistEntitySchema } from "../smart-playlists";
import { userEntitySchema } from "../../../models/auth";

export const musicUserListEntryTypeSchema = z.enum(["playlist", "smart-playlist"]);

export const musicUserListEntrySchema = z.object( {
  id: mongoDbId,
  resourceId: mongoDbId, // Referencia al recurso (Playlist o SmartPlaylist)
  type: musicUserListEntryTypeSchema,
} );

export const musicUserListEntryWithResourceSchema = musicUserListEntrySchema.extend( {
  resource: musicPlaylistEntitySchema.or(musicSmartPlaylistEntitySchema).optional(),
} );

export const musicUserListSchema = z.object( {
  ownerUserId: mongoDbId,
  list: z.array(musicUserListEntrySchema),
} );

export const musicUserListEntitySchema = musicUserListSchema
  .omit( {
    list: true,
  } )
  .extend( {
    id: mongoDbId,
    list: z.array(musicUserListEntryWithResourceSchema),
    ownerUser: userEntitySchema.optional(),
  } );

export type MusicUserListEntryType = z.infer<typeof musicUserListEntryTypeSchema>;

export type MusicUserListEntry = z.infer<typeof musicUserListEntrySchema>;

export type MusicUserList = z.infer<typeof musicUserListSchema>;

export type MusicUserListEntity = z.infer<typeof musicUserListEntitySchema>;

export const musicUserListResourceItemSchema = z.intersection(
  z.object( {
    id: z.string(),
    resourceId: mongoDbId,
    sortIndex: z.number().int()
      .positive(),
  } ),
  z.discriminatedUnion("type", [
    z.object( {
      type: z.literal("playlist"),
      resource: musicPlaylistEntitySchema.optional(),
    } ),
    z.object( {
      type: z.literal("smart-playlist"),
      resource: musicSmartPlaylistEntitySchema.optional(),
    } ),
  ]),
);

export type MusicUserListResourceItem = z.infer<typeof musicUserListResourceItemSchema>;
