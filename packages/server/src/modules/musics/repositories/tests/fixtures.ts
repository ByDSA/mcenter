import { Music } from "#shared/models/musics";
import { deepFreeze } from "#shared/utils/objects";

const DATE = new Date();
const AOT4_COMMON = {
  artist: "artist",
  weight: 0,
  hash: "132e004ea6dc462fb714ce4c66ec77b1",
  size: 7614308,
  timestamps: {
    createdAt: DATE,
    updatedAt: DATE,
  },
  mediaInfo: {
    duration: 123,
  },
};

/* eslint-disable import/prefer-default-export */
export const MUSICS_SAMPLES_IN_DISK: Music[] = deepFreeze([
  {
    id: "1",
    path: "aot4_copy.mp3",
    title: "aot4_copy",
    url: "aot4_copy",
    ...AOT4_COMMON,
  },
  {
    id: "2",
    path: "dk.mp3",
    title: "dk",
    url: "dk",
    artist: "artist",
    weight: 0,
    hash: "53cc4a37a3daa3ff0e283deac3d2f9b2",
    size: 6369835,
    timestamps: {
      createdAt: DATE,
      updatedAt: DATE,
    },
    mediaInfo: {
      duration: 123,
    },
  },
  {
    id: "3",
    path: "Driftveil.mp3",
    title: "Driftveil",
    url: "driftveil",
    artist: "artist",
    weight: 0,
    hash: "4c8d3285f37bd9537e66fb8a4034edff",
    size: 10096359,
    timestamps: {
      createdAt: DATE,
      updatedAt: DATE,
    },
    mediaInfo: {
      duration: 123,
    },
  },
  {
    id: "4",
    path: "a/aot4.mp3",
    title: "aot4",
    url: "aot4",
    ...AOT4_COMMON,
  },
]);