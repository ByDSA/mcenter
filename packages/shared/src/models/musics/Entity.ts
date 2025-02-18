import { z } from "zod";
import { AssertZodSettings, assertZodPopStack } from "../../utils/validation/zod";
import { musicVoSchema } from "./VO";

export const idSchema = z.string();

export type MusicId = z.infer<typeof idSchema>;

export const entitySchema = musicVoSchema.merge(z.object( {
  id: idSchema,
} ));

export type Music = z.infer<typeof entitySchema>;

export function assertIsMusic(
  model: unknown,
  settings?: AssertZodSettings,
): asserts model is Music {
  assertZodPopStack(entitySchema, model, settings);
}

export function parseMusic(model: unknown): Music {
  return entitySchema.parse(model);
}

export function compareMusicId(a: MusicId, b: MusicId): boolean {
  return a === b;
}
