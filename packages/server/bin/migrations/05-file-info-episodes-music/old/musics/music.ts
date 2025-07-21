import z from "zod";
import { genAssertZod } from "$shared/utils/validation/zod";
import { fileInfoSchema } from "../episodes/file-info";
import { resourceSchema } from "../episodes/resource";
import { localFileSchema, pickableSchema, taggableSchema } from "../episodes/partial-schemas";

const optionalPropsSchema = z.object( {
  album: z.string().optional(),
  game: z.string().optional(),
  year: z.number().int()
    .optional(),
  country: z.string().optional(),
  spotifyId: z.string().optional(),
} );
const idSchema = z.string();

type Id = z.infer<typeof idSchema>;

const modelSchema = optionalPropsSchema.extend( {
  artist: z.string(),
  url: z.string(),
  mediaInfo: z.object( {
    duration: z.number().nullable(),
  } ).strict(),
} )
// TODO: quitar FileInfo de aquí y ponerlo en un 'fileInfoAudio'
  .merge(fileInfoSchema)
  .merge(resourceSchema)
  .merge(pickableSchema)
  .merge(localFileSchema)
  .merge(taggableSchema);

type Model = z.infer<typeof modelSchema>;

const entitySchema = modelSchema.extend( {
  id: idSchema,
} );

type Entity = z.infer<typeof entitySchema>;

function compareId(a: Id, b: Id): boolean {
  return a === b;
}

const assertIs = genAssertZod(modelSchema);

export {
  idSchema as musicIdSchema,
  entitySchema as musicEntitySchema,
  Entity as MusicEntity,
  Id as MusicId,
  modelSchema as musicSchema,
  Model as Music,
  assertIs as assertIsMusic,
  compareId as compareMusicId,
};
