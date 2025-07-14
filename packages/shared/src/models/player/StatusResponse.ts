import z from "zod";
import { assertZod } from "../../utils/validation/zod";
import { playlistElementSchema } from "./PlaylistElement";

const statusResponseSchema = z.object( {
  open: z.boolean(),
  status: z.object( {
    time: z.number().nonnegative(),
    length: z.number()
      .step(1)
      .gte(-1),
    state: z.enum(["playing", "paused", "stopped"]),
    volume: z.number(), // a veces, cuando no hay ningún medio, es -256
    meta: z.object( {
      title: z.string().optional(),
      filename: z.string().optional(),
    } ).optional(),
    info: z.array(z.object( {} )).optional(),
    original: z.object( {} ),
    playlist: z.object( {
      previous: z.array(playlistElementSchema),
      current: playlistElementSchema.optional(),
      next: z.array(playlistElementSchema),
    } ).optional(),
  } ).optional(),
} ).strict();

export type PlayerStatusResponse = z.infer<typeof statusResponseSchema>;

export function assertIsPlayerStatusResponse(o: unknown): asserts o is PlayerStatusResponse {
  assertZod(statusResponseSchema, o);
}
