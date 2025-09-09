/* eslint-disable camelcase */
import { z } from "zod";

const thumbnailSchema = z.object( {
  url: z.string().url(),
  height: z.number(),
  width: z.number(),
} );
const versionSchema = z.object( {
  version: z.string(),
  current_git_head: z.string().nullable(),
  release_git_head: z.string(),
  repository: z.string(),
} );
const playlistItemSchema = z.object( {
  _type: z.literal("url"),
  ie_key: z.string(),
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  description: z.string().nullable(),
  duration: z.number(),
  channel_id: z.string(),
  channel: z.string(),
  channel_url: z.string().url(),
  uploader: z.string(),
  uploader_id: z.string().nullable(),
  uploader_url: z.string().nullable(),
  thumbnails: z.array(thumbnailSchema),
  timestamp: z.number().nullable(),
  release_timestamp: z.number().nullable(),
  availability: z.string().nullable(),
  view_count: z.number(),
  live_status: z.string().nullable(),
  channel_is_verified: z.boolean().nullable(),
  __x_forwarded_for_ip: z.string().nullable(),
  webpage_url: z.string().url(),
  original_url: z.string().url(),
  webpage_url_basename: z.string(),
  webpage_url_domain: z.string(),
  extractor: z.string(),
  extractor_key: z.string(),
  playlist_count: z.number(),
  playlist: z.string(),
  playlist_id: z.string(),
  playlist_title: z.string(),
  playlist_uploader: z.string(),
  playlist_uploader_id: z.string().nullable(),
  playlist_channel: z.string(),
  playlist_channel_id: z.string().nullable(),
  playlist_webpage_url: z.string().url(),
  n_entries: z.number(),
  playlist_index: z.number(),
  __last_playlist_index: z.number(),
  playlist_autonumber: z.number(),
  epoch: z.number(),
  duration_string: z.string(),
  release_year: z.number().nullable(),
  _version: versionSchema,
} );

export const playlistSchema = z.array(playlistItemSchema);

export function parsePlaylistFromLines(linesString: string) {
  try {
    const lines = linesString.trim().split("\n");
    const items = lines.map(line => {
      const parsed = JSON.parse(line);

      return playlistItemSchema.parse(parsed);
    } );

    return items;
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new Error(`JSON inválido en una de las líneas: ${error.message}`);

    throw error;
  }
}

export type Playlist = z.infer<typeof playlistSchema>;
