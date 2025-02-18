import { Music, MusicVO } from "#shared/models/musics";
import { deepFreeze } from "#shared/utils/objects";
import mongoose from "mongoose";
import { DATEJS_SAMPLE1 } from "../dates";

export const A_AOT4_VO: MusicVO = {
  artist: "undefined",
  title: "undefined",
  url: "a_aot4",
  hash: "132e004ea6dc462fb714ce4c66ec77b1",
  mediaInfo: {
    duration: 0,
  },
  path: "a/aot4.mp3",
  tags: ["t1", "only-t2"],
  size: 0,
  timestamps: {
    createdAt: DATEJS_SAMPLE1,
    updatedAt: DATEJS_SAMPLE1,
    addedAt: DATEJS_SAMPLE1,
  },
  weight: 50,
};

export const A_AOT4: Music = {
  id: new mongoose.Types.ObjectId().toString(),
  ...A_AOT4_VO,
};

export const AOT4_COPY_VO: MusicVO = {
  ...A_AOT4_VO,
  url: "aot4_copy",
  path: "aot4_copy.mp3",
};

export const AOT4_COPY: Music = {
  id: new mongoose.Types.ObjectId().toString(),
  ...AOT4_COPY_VO,
};

export const DK_VO: MusicVO = {
  ...A_AOT4_VO,
  weight: 0,
  url: "dk",
  path: "dk.mp3",
  hash: "53cc4a37a3daa3ff0e283deac3d2f9b2",
};

export const DK: Music = {
  ...DK_VO,
  id: new mongoose.Types.ObjectId().toString(),
};

export const DRIFTVEIL_VO: MusicVO = {
  ...A_AOT4_VO,
  url: "driftveil",
  path: "Driftveil.mp3",
  hash: "4c8d3285f37bd9537e66fb8a4034edff",
  weight: -5,
};

export const DRIFTVEIL: Music = {
  id: new mongoose.Types.ObjectId().toString(),
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
