import { z } from "zod";

export const schema = z.object( {
  params: z.object( {
    id: z.string(),
  } ).strict(),
} ).required();

export type Type = z.infer<typeof schema>;

export function assert(o: unknown): asserts o is Type {
  schema.parse(o);
}
