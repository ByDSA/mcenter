import z from "zod";

const MD5HashSchema = z.string()
  .refine((hash) => (hash && /^[a-f0-9]{32}$/.test(hash)) || !hash, {
    message: "hash must be a md5 hash",
  } );

export const Schema = z.object( {
  path: z.string(),
  hash: MD5HashSchema,
  size: z.number(),
} ).strict();

export type Model = z.infer<typeof Schema>;

export function assertIsModel(model: unknown): asserts model is Model {
  Schema.parse(model);
}

export function compareModel(a: Model, b: Model): boolean {
  return a.path === b.path && a.hash === b.hash && a.size === b.size;
}