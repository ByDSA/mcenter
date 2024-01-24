import { z } from "zod";
import { EntitySchema } from "../Entity";

export const Schema = z.object( {
  entity: EntitySchema.strict().optional(),
} ).strict();

export type Type = z.infer<typeof Schema>;

export function assert(o: unknown): asserts o is Type {
  Schema.parse(o);
}