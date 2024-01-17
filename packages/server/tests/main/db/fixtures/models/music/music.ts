import { Music, MusicVO } from "#shared/models/musics";
import { deepFreeze } from "#shared/utils/objects";
import { DATEJS_SAMPLE1 } from "../dates";

export const A_AOT4_VO: MusicVO = {
  artist: "undefined",
  title: "undefined",
  url: "undefined",
  hash: "132e004ea6dc462fb714ce4c66ec77b1",
  mediaInfo: {
    duration: 0,
  },
  path: "a/aot4.mp3",
  size: 0,
  timestamps: {
    createdAt: DATEJS_SAMPLE1,
    updatedAt: DATEJS_SAMPLE1,
  },
  weight: 0,
};

export const A_AOT4: Music = {
  id: "1",
  ...A_AOT4_VO,
};

export const AOT4_COPY_VO: MusicVO = {
  ...A_AOT4_VO,
  path: "aot4_copy.mp3",
};

export const AOT4_COPY: Music = {
  id: "2",
  ...AOT4_COPY_VO,
};

export const DK_VO: MusicVO = {
  ...A_AOT4_VO,
  path: "dk.mp3",
  hash: "53cc4a37a3daa3ff0e283deac3d2f9b2",
};

export const DK: Music = {
  ...DK_VO,
  id: "3",
};

export const DRIFTVEIL_VO: MusicVO = {
  ...A_AOT4_VO,
  path: "Driftveil.mp3",
  hash: "4c8d3285f37bd9537e66fb8a4034edff",
};

export const DRIFTVEIL: Music = {
  id: "4",
  ...DRIFTVEIL_VO,
};

export const MUSIC_FILE_SAMPLES: Music[] = deepFreeze([
  A_AOT4,
  AOT4_COPY,
  DK,
  DRIFTVEIL,
]);

export const MUSIC_FILE_VO_SAMPLES: MusicVO[] = deepFreeze([
  A_AOT4_VO,
  AOT4_COPY_VO,
  DK_VO,
  DRIFTVEIL_VO,
]);