import { z } from "zod";
import { assertZod } from "../../../utils/validation/zod";
import { PlaylistElementSchema } from "./PlaylistElement";

const StatusResponseSchema = z.object( {
  running: z.boolean(),
  status: z.object( {
    time: z.number().nonnegative(),
    length: z.number()
      .step(1)
      .gte(-1),
    state: z.enum([ "playing", "paused", "stopped" ]),
    volume: z.number(), // a veces, cuando no hay ningún medio, es -256
    meta: z.object( {
      title: z.string().optional(),
      filename: z.string().optional(),
    } ).optional(),
    info: z.array(z.object( {

    } )).optional(),
    original: z.object( {
    } ),
    playlist: z.object( {
      previous: z.array(PlaylistElementSchema),
      current: PlaylistElementSchema.optional(),
      next: z.array(PlaylistElementSchema),
    } ).optional(),
  } ).optional(),
} ).strict();

type StatusResponse = z.infer<typeof StatusResponseSchema>;
export default StatusResponse;

export function assertIsStatusResponse(o: unknown): asserts o is StatusResponse {
  assertZod(StatusResponseSchema, o);
}