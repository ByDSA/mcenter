import { z } from "zod";

const numeric = z.string().refine(val=>!Number.isNaN(+val), {
  message: "Not a number",
} );
const ro = z.enum([ "rw", "ro" ]);
const element = {
  "@_name": z.string(),
  "@_ro": ro,
  "@_id": numeric,
};
const PlaylistElementSchema = z.object( {
  ...element,
  "@_uri": z.string(),
  "@_duration": numeric,
  "@_current": z.enum(["current"]).optional(),
} ).strict();
const PlaylistResponseSchema = z.object( {
  node: z.object( {
    ...element,
    node: z.array(z.object( {
      ...element,
      leaf: z.array(PlaylistElementSchema).or(PlaylistElementSchema)
        .optional(),
    } ).strict()),
  } ),
} );

type PlaylistResponse = z.infer<typeof PlaylistResponseSchema>;
export default PlaylistResponse;

export type PlaylistELement = z.infer<typeof PlaylistElementSchema>;

export function assertIsPlaylistResponse(obj: unknown): asserts obj is PlaylistResponse {
  PlaylistResponseSchema.parse(obj);
}