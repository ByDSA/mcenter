import z from "zod";
import { genAssertZod } from "../../utils/validation/zod";
import { timestampsFileSchema } from "../utils/schemas/timestamps";

export const md5HashSchema = z.string()
  .refine((hash) => (hash && /^[a-f0-9]{32}$/.test(hash)) || !hash, {
    message: "hash must be a md5 hash",
  } );
const schema = z.object( {
  path: z.string(),
  hash: md5HashSchema,
  size: z.number(),
  timestamps: timestampsFileSchema,
  offloaded: z.boolean().optional(),
} )
  .strict();

type Model = z.infer<typeof schema>;

const assertIsModel = genAssertZod(schema);

function compareModel(a: Model, b: Model): boolean {
  return a.path === b.path && a.hash === b.hash && a.size === b.size;
}

function getFirstAvailableFileInfoOrFirst<T extends Model>(fileInfos: T[] | undefined): T | null {
  if (!fileInfos)
    return null;

  for (const fileInfo of fileInfos) {
    if (fileInfo.offloaded !== true)
      return fileInfo;
  }

  return fileInfos[0] ?? null;
}

function isFileInfoUnavailable<T extends Model>(fileInfo: T | null | undefined): boolean {
  return !fileInfo || !!fileInfo.offloaded;
}

export {
  schema as fileInfoSchema,
  type Model as FileInfo,
  assertIsModel as assertIsFileInfo,
  compareModel as compareFileInfo,
  getFirstAvailableFileInfoOrFirst,
  isFileInfoUnavailable,
};
