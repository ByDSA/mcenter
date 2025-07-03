export {
  assertIsMusic, compareMusicId, Music, MusicId, parseMusic,
} from "./Entity";

export {
  assertIsMusicVO, MusicVO, musicVoSchema as MusicVOSchema,
} from "./VO";

export const ARTIST_EMPTY = "(Unknown Artist)";

export {
  assertIsGetOneByIdReq as assertIsMusicGetOneByIdReq,
  assertIsPatchOneByIdReq as assertIsMusicPatchOneByIdReq,
  assertIsPatchOneByIdReqBody as assertIsMusicPatchOneByIdReqBody,
  assertIsPatchOneByIdResBody as assertIsMusicPatchOneByIdResBody,
  getOneByIdReqSchema as MusicGetOneByIdSchema,
  PatchOneByIdResBody as MusicPatchOneByIdResBody,
  PatchOneByIdSchema as MusicPatchOneByIdSchema, type GetOneByIdReq as MusicGetOneByIdReq,
  type PatchOneByIdReq as MusicPatchOneByIdReq,
  type PatchOneByIdReqBody as MusicPatchOneByIdReqBody,
} from "./dto";
