import z from "zod";
import { playlistElementSchema } from "./playlist-element";

export const playerStatusResponseSchema = z.object( {
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

export type PlayerStatusResponse = z.infer<typeof playerStatusResponseSchema>;
