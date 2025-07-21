import z from "zod";

export const playlistElementSchema = z.object( {
  name: z.string(),
  uri: z.string(),
  duration: z.number(),
  id: z.number(),
  current: z.boolean().optional(),
} ).strict();

export type PlayerPlaylistElement = z.infer<typeof playlistElementSchema>;
