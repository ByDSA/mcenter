import z from "zod";

const md5HashSchema = z.string()
  .refine((hash) => (hash && /^[a-f0-9]{32}$/.test(hash)) || !hash, {
    message: "hash must be a md5 hash",
  } );
const schema = z.object( {
  path: z.string(),
  hash: md5HashSchema,
  size: z.number(),
} ).strict();

type Model = z.infer<typeof schema>;

function assertIsModel(model: unknown): asserts model is Model {
  schema.parse(model);
}

function compareModel(a: Model, b: Model): boolean {
  return a.path === b.path && a.hash === b.hash && a.size === b.size;
}

export {
  schema as fileInfoSchema,
  Model as FileInfo,
  assertIsModel as assertIsFileInfo,
  compareModel as compareFileInfo,
};
