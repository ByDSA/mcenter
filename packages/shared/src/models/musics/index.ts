export {
  Entity as Music, Id as MusicID, assertIsEntity as assertIsMusic, compareId as compareMusicId, parse as parseMusic,
} from "./Entity";

export {
  VO as MusicVO, VOSchema as MusicVOSchema, assertIsVO as assertIsMusicVO,
} from "./VO";

export const ARTIST_EMPTY = "(Unknown Artist)";

export {
  HistoryEntry as HistoryMusicEntry, HistoryListGetManyEntriesBySearchRequest as HistoryMusicListGetManyEntriesBySearchRequest,
  HistoryListGetManyEntriesBySearchResponse as HistoryMusicListGetManyEntriesBySearchResponse, HistoryListGetManyEntriesBySearchResponseSchema as HistoryMusicListGetManyEntriesBySearchResponseSchema, assertIsHistoryEntry as assertIsHistoryMusicEntry, assertIsHistoryListGetManyEntriesBySearchRequest as assertIsHistoryMusicListGetManyEntriesBySearchRequest,
  assertIsHistoryListGetManyEntriesBySearchResponse as assertIsHistoryMusicListGetManyEntriesBySearchResponse, createHistoryEntryById as createHistoryEntryByMusicId,
} from "./history";

export {
  GetOneByIdSchema as MusicGetOneByIdSchema, PatchOneByIdResBody as MusicPatchOneByIdResBody, PatchOneByIdSchema as MusicPatchOneByIdSchema, assertIsGetOneByIdReq as assertIsMusicGetOneByIdReq, assertIsPatchOneByIdReq as assertIsMusicPatchOneByIdReq, assertIsPatchOneByIdReqBody as assertIsMusicPatchOneByIdReqBody, assertIsPatchOneByIdResBody as assertIsMusicPatchOneByIdResBody, type GetOneByIdReq as MusicGetOneByIdReq, type PatchOneByIdReq as MusicPatchOneByIdReq, type PatchOneByIdReqBody as MusicPatchOneByIdReqBody,
} from "./dto";
