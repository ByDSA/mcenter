/* eslint-disable import/no-extraneous-dependencies */
import { z } from "zod";
import { assertZodPopStack } from "../../utils/validation/zod";
import { VOSchema } from "./VO";

const IDSchema = z.string();

export type Id = z.infer<typeof IDSchema>;

export const EntitySchema = VOSchema.merge(z.object( {
  id: IDSchema,
} ));

export type Entity = z.infer<typeof EntitySchema>;

export function assertIsEntity(model: unknown, msg?: string): asserts model is Entity {
  assertZodPopStack(EntitySchema, model, msg);
}

export function parse(model: unknown): Entity {
  return EntitySchema.parse(model);
}

export function compareId(a: Id, b: Id): boolean {
  return a === b;
}