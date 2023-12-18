import z from "zod";

export const Schema = z.object( {
  path: z.string(),
  hash: z.string()
    .refine((hash) => (hash && /^[a-f0-9]{32}$/.test(hash)) || !hash, {
      message: "hash must be a md5 hash",
    } ),
  size: z.number(),
  timestamps: z.object( {
    createdAt: z.date(),
    updatedAt: z.date(),
  } ).strict(),
} ).strict();

export type Model = z.infer<typeof Schema>;

export function assertIsModel(model: unknown): asserts model is Model {
  Schema.parse(model);
}

export function compareModel(a: Model, b: Model): boolean {
  const sameTimestamps = a.timestamps.createdAt?.toString() === b.timestamps.createdAt?.toString() && a.timestamps.updatedAt?.toString() === b.timestamps.updatedAt?.toString();

  return a.path === b.path && a.hash === b.hash && a.size === b.size && sameTimestamps;
}