import { z } from "zod";

export const Schema = z.object( {
} )
  .strict();

export type Type = z.infer<typeof Schema>;

export function assert(o: unknown): asserts o is Type {
  Schema.parse(o);
}