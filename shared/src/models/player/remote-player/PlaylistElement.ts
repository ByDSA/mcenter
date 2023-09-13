import { z } from "zod";
import { assertZod } from "../../../utils/validation/zod";

export const PlaylistElementSchema = z.object( {
  name: z.string(),
  uri: z.string(),
  duration: z.number(),
  id: z.number(),
  current: z.boolean().optional(),
} ).strict();

type PlaylistELement = z.infer<typeof PlaylistElementSchema>;
export default PlaylistELement;

export function assertIsPlaylistElement(o: unknown): asserts o is PlaylistELement {
  assertZod(PlaylistElementSchema, o);
}