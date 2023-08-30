import { assertZodPopStack } from "#utils/validation/zod";
import { z } from "zod";

export const ModelSchema = z.object( {
  title: z.string(),
  path: z.string(),
  weight: z.number(),
  start: z.number(),
  end: z.number(),
  tags: z.array(z.string()).optional(),
  duration: z.number().optional(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
} );

type Model = z.infer<typeof ModelSchema>;

export default Model;

export function copyOfResource(e: Model): Model {
  const ret: Model = {
    title: e.title,
    path: e.path,
    weight: e.weight,
    start: e.start,
    end: e.end,
  };

  if (e.tags !== undefined)
    ret.tags = e.tags;

  if (e.duration !== undefined)
    ret.duration = e.duration;

  if (e.disabled !== undefined)
    ret.disabled = e.disabled;

  if (e.lastTimePlayed !== undefined)
    ret.lastTimePlayed = e.lastTimePlayed;

  return ret;
}

export function assertIsResource(model: unknown): asserts model is Model {
  assertZodPopStack(ModelSchema, model);
}