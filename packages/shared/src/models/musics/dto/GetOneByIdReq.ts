import { z } from "zod";

export const Schema = z.object( {
  params: z.object( {
    id: z.string(),
  } ).strict(),
} ).required();

export type Type = z.infer<typeof Schema>;

export function assert(o: unknown): asserts o is Type {
  Schema.parse(o);
}