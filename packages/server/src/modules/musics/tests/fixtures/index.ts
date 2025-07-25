import { deepFreeze } from "$shared/utils/objects";
import { MusicEntity } from "$shared/models/musics/music";
import { Types } from "mongoose";
import { DATEJS_SAMPLE1 } from "#tests/main/db/fixtures/models/dates";

const AOT4_COMMON = {
  artist: "artist",
  weight: 0,
  timestamps: {
    createdAt: DATEJS_SAMPLE1,
    updatedAt: DATEJS_SAMPLE1,
    addedAt: DATEJS_SAMPLE1,
  },
};

export const A_AOT4: MusicEntity = {
  id: new Types.ObjectId().toString(),
  title: "undefined",
  url: "a_aot4",
  tags: ["t1", "only-t2"],
  ...AOT4_COMMON,
};

const AOT4_COPY: MusicEntity = {
  ...AOT4_COMMON,
  id: new Types.ObjectId().toString(),
  title: "aot4_copy",
  url: "aot4_copy",
  tags: ["t1", "t3"],
};
const DK: MusicEntity = {
  ...AOT4_COMMON,
  weight: 50,
  url: "dk",
  id: new Types.ObjectId().toString(),
  title: "DK",
  tags: ["t1"],
};
const DRIFTVEIL: MusicEntity = {
  ...AOT4_COMMON,
  id: new Types.ObjectId().toString(),
  url: "driftveil",
  weight: -5,
  artist: "artist",
  title: "Driftveil",
  tags: ["only-t2", "t4"],
};
const MUSIC_FILE_SAMPLES: MusicEntity[] = deepFreeze([
  A_AOT4,
  AOT4_COPY,
  DK,
  DRIFTVEIL,
]);

export const fixtureMusics = {
  Disk: {
    Samples: {
      A_AOT4,
      AOT4_COPY,
      DK,
      DRIFTVEIL,
    },
    List: MUSIC_FILE_SAMPLES,
  },
};
