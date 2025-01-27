import { z } from "zod";

const numeric = z.string().refine(val=>!Number.isNaN(+val), {
  message: "Not a number",
} );
const ro = z.enum(["rw", "ro"]);
const element = {
  "@_name": z.string(),
  "@_ro": ro,
  "@_id": numeric,
};
const playlistElementSchema = z.object( {
  ...element,
  "@_uri": z.string(),
  "@_duration": numeric,
  "@_current": z.enum(["current"]).optional(),
} ).strict();
const playlistResponseSchema = z.object( {
  node: z.object( {
    ...element,
    node: z.array(z.object( {
      ...element,
      leaf: z.array(playlistElementSchema).or(playlistElementSchema)
        .optional(),
    } ).strict()),
  } ),
} );

export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;

export type PlaylistELement = z.infer<typeof playlistElementSchema>;

export function assertIsPlaylistResponse(obj: unknown): asserts obj is PlaylistResponse {
  playlistResponseSchema.parse(obj);
}
