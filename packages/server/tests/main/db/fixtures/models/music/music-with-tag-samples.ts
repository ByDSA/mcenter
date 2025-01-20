/* eslint-disable import/prefer-default-export */
import { Music } from "#shared/models/musics";
import { deepFreeze } from "#shared/utils/objects";
import { A_AOT4, DK, DRIFTVEIL } from "./music";

const musicWithTag1 = {
  ...DK,
  tags: ["t1"],
};
const musicWithTag2Only = {
  ...DRIFTVEIL,
  tags: ["only-t2", "t4"],
};
const musicWithTag1And3 = {
  ...A_AOT4,
  tags: ["t1", "t3"],
};

export const MUSICS_WITH_TAGS_SAMPLES: Music[] = deepFreeze([
  musicWithTag1,
  musicWithTag2Only,
  musicWithTag1And3,
]);
