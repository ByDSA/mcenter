export {
  Entity as Music, Id as MusicID, assertIsEntity as assertIsMusic, compareId as compareMusicId, parse as parseMusic,
} from "./Entity";

export {
  VO as MusicVO, assertIsVO as assertIsMusicVO,
} from "./VO";

export const ARTIST_EMPTY = "(Unknown Artist)";