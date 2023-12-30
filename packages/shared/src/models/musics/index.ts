export {
  Entity as Music, ID as MusicID, assertIsEntity as assertIsMusic, compareId as compareMusicId, compareEntityWithId as compareMusicWithId, getIdOfEntity as getIdOfMusic, parse as parseMusic,
} from "./Entity";

export {
  VO as MusicVO, assertIsVO as assertIsMusicVO,
} from "./VO";

export const ARTIST_EMPTY = "(Unknown Artist)";