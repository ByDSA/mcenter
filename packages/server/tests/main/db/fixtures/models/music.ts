import { Music } from "#shared/models/musics";
import { deepFreeze } from "#shared/utils/objects";

export const A_AOT4: Music = {
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
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  weight: 0,
};

export const AOT4_COPY: Music = {
  ...A_AOT4,
  path: "aot4_copy.mp3",
};

export const DK: Music = {
  ...A_AOT4,
  path: "dk.mp3",
  hash: "53cc4a37a3daa3ff0e283deac3d2f9b2",
};

export const DRIFTVEIL: Music = {
  ...A_AOT4,
  path: "Driftveil.mp3",
  hash: "4c8d3285f37bd9537e66fb8a4034edff",
};

// eslint-disable-next-line import/prefer-default-export
export const MUSIC_FILE_SAMPLES: Music[] = deepFreeze([
  A_AOT4,
  AOT4_COPY,
  DK,
  DRIFTVEIL,
]);