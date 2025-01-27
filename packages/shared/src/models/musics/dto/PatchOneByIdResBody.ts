import { z } from "zod";

export const schema = z.object( {} )
  .strict();

export type Type = z.infer<typeof schema>;

export function assert(o: unknown): asserts o is Type {
  schema.parse(o);
}
