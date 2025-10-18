import { ObjectId } from "mongodb";
import { fixtureUsers } from "../../auth/tests/fixtures";
import { deepFreeze } from "../../../utils/objects";
import { MusicEntity } from "../music";
import { DATEJS_SAMPLE1 } from "../../../../tests/other-fixtures/dates";
import { MusicUserInfoEntity } from "../user-info/user-info";

const AOT4_COMMON = {
  artist: "artist",
  uploaderUserId: fixtureUsers.Admin.User.id,
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
  addedAt: DATEJS_SAMPLE1,
};

export const A_AOT4: MusicEntity = {
  id: new ObjectId().toString(),
  title: "undefined",
  slug: "a_aot4",
  tags: ["t1", "only-t2"],
  ...AOT4_COMMON,
};

const AOT4_COPY: MusicEntity = {
  ...AOT4_COMMON,
  id: new ObjectId().toString(),
  title: "aot4_copy",
  slug: "aot4_copy",
  tags: ["t1", "t3"],
};
const DK: MusicEntity = {
  ...AOT4_COMMON,
  slug: "dk",
  id: new ObjectId().toString(),
  title: "DK",
  tags: ["t1"],
};
const DRIFTVEIL: MusicEntity = {
  ...AOT4_COMMON,
  id: new ObjectId().toString(),
  slug: "driftveil",
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
const userInfo: MusicUserInfoEntity = {
  id: new ObjectId().toString(),
  userId: fixtureUsers.Normal.User.id,
  musicId: A_AOT4.id,
  lastTimePlayed: 0,
  weight: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ["userTag"],
};
const samples = {
  A_AOT4,
  AOT4_COPY,
  DK,
  DRIFTVEIL,
};
const samplesWithUserInfo = Object.values(samples).map(s=> ( {
  ...s,
  userInfo: {
    ...userInfo,
    musicId: s.id,
  },
} ));

samplesWithUserInfo[0].userInfo.weight = 11;

export const fixtureMusics = {
  Disk: {
    Samples: samples,
    List: MUSIC_FILE_SAMPLES,
    WithUserInfo: {
      List: samplesWithUserInfo,
    },
  },
};
