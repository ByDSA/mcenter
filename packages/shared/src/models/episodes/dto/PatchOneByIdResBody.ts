import { z } from "zod";
import { entitySchema } from "../Entity";

export const schema = z.object( {
  entity: entitySchema.strict().optional(),
} ).strict();

export type Type = z.infer<typeof schema>;

export function assert(o: unknown): asserts o is Type {
  schema.parse(o);
}
