import { deepFreeze } from "$shared/utils/objects";
import { MusicFileInfo, MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { Types } from "mongoose";
import { DATEJS_SAMPLE1 } from "#tests/main/db/fixtures/models/dates";
import { fixtureMusics } from "../../../tests/fixtures";

const DATE = new Date();
const AOT4_COMMON_FILE_INFO: Omit<MusicFileInfo, "musicId" | "path"> = {
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
const fileInfoTimestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
};
const A_AOT4: MusicFileInfoEntity = {
  id: new Types.ObjectId().toString(),
  musicId: fixtureMusics.Disk.Samples.A_AOT4.id,
  hash: "132e004ea6dc462fb714ce4c66ec77b1",
  mediaInfo: {
    duration: 0,
  },
  path: "a/aot4.mp3",
  size: 0,
  timestamps: fileInfoTimestamps,
};
const DK: MusicFileInfoEntity = {
  ...A_AOT4,
  id: new Types.ObjectId().toString(),
  musicId: fixtureMusics.Disk.Samples.DK.id,
  path: "dk.mp3",
  hash: "53cc4a37a3daa3ff0e283deac3d2f9b2",
};
const DRIFTVEIL: MusicFileInfoEntity = {
  ...A_AOT4,
  id: new Types.ObjectId().toString(),
  musicId: fixtureMusics.Disk.Samples.DRIFTVEIL.id,
  path: "Driftveil.mp3",
  hash: "4c8d3285f37bd9537e66fb8a4034edff",
};
const AOT4_COPY: MusicFileInfoEntity = {
  ...AOT4_COMMON_FILE_INFO,
  id: new Types.ObjectId().toString(),
  musicId: fixtureMusics.Disk.Samples.AOT4_COPY.id,
  path: "aot4_copy.mp3",
};
const SAMPLES_IN_DISK: MusicFileInfoEntity[] = deepFreeze([
  AOT4_COPY,
  DK,
  DRIFTVEIL,
  A_AOT4,
]);

export const fixtureMusicFileInfos = {
  Disk: {
    Samples: {
      A_AOT4,
      DK,
      DRIFTVEIL,
      AOT4_COPY,
    },
    List: SAMPLES_IN_DISK,
  },
};
