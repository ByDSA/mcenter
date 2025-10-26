import z from "zod";
import { genAssertZod } from "../../utils/validation/zod";
import { resourceSchema } from "../resources";
import { taggableSchema } from "../resources/partial-schemas";
import { musicFileInfoEntitySchema } from "./file-info";
import { musicUserInfoSchema } from "./user-info/user-info";

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
  slug: z.string(),
} )
  .merge(resourceSchema)
  .merge(taggableSchema);

type Model = z.infer<typeof modelSchema>;

const entitySchema = modelSchema.extend( {
  id: idSchema,
  fileInfos: z.array(musicFileInfoEntitySchema).optional(),
  userInfo: musicUserInfoSchema.optional(),
} );

type Entity = z.infer<typeof entitySchema>;

function compareId(a: Id, b: Id): boolean {
  return a === b;
}

const assertIsModel = genAssertZod(modelSchema);
const assertIsEntity = genAssertZod(entitySchema);
const entityWithFileInfosSchema = entitySchema.required( {
  fileInfos: true,
} );

type EntityWithFileInfos = z.infer<typeof entityWithFileInfosSchema>;
const entityWithUserInfoSchema = entitySchema.required( {
  userInfo: true,
} );

type EntityWithUserInfo = z.infer<typeof entityWithUserInfoSchema>;
export {
  idSchema as musicIdSchema,
  entitySchema as musicEntitySchema,
  Entity as MusicEntity,
  Id as MusicId,
  modelSchema as musicSchema,
  Model as Music,
  EntityWithFileInfos as MusicEntityWithFileInfos,
  entityWithFileInfosSchema as musicEntityWithFileInfosSchema,
  entityWithUserInfoSchema as musicEntityWithUserInfoSchema,
  EntityWithUserInfo as MusicEntityWithUserInfo,
  assertIsModel as assertIsMusic,
  assertIsEntity as assertIsMusicEntity,
  compareId as compareMusicId,
};
