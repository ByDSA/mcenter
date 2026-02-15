/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import { ObjectId } from "mongodb";
import { dateToTimestampInSeconds } from "../../../utils/time/timestamp";
import { fixtureUsers } from "../../auth/tests/fixtures";
import { deepFreeze, WithRequired } from "../../../utils/objects";
import { MusicEntity } from "../music";
import { DATEJS_SAMPLE1 } from "../../../../tests/other-fixtures/dates";
import { MusicUserInfoEntity } from "../user-info/user-info";
import { MusicFileInfoEntity } from "../file-info/file-info";
import { MusicHistoryEntryEntity } from "../history";
import { MusicPlaylistEntity } from "../playlists";
import { MusicSmartPlaylistEntity } from "../smart-playlists";
import { MusicUserListEntity } from "../users-lists";

const timestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
};
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
  slug: "a-aot4",
  tags: ["t1", "t2"],
  ...AOT4_COMMON,
};

const AOT4_COPY: MusicEntity = {
  ...AOT4_COMMON,
  id: new ObjectId().toString(),
  title: "aot4_copy",
  slug: "aot4-copy",
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
  tags: ["t2", "t4"],
};
const fileInfoTimestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
};
const A_AOT4_FILE_INFO: MusicFileInfoEntity = {
  id: new ObjectId().toString(),
  musicId: A_AOT4.id,
  hash: "132e004ea6dc462fb714ce4c66ec77b1",
  mediaInfo: {
    duration: 0,
  },
  path: "a/aot4.mp3",
  size: 7614308,
  timestamps: fileInfoTimestamps,
};
const DK_FILE_INFO: MusicFileInfoEntity = {
  ...A_AOT4_FILE_INFO,
  id: new ObjectId().toString(),
  size: 6369835,
  musicId: DK.id,
  path: "dk.mp3",
  hash: "53cc4a37a3daa3ff0e283deac3d2f9b2",
};
const DRIFTVEIL_FILE_INFO: MusicFileInfoEntity = {
  ...A_AOT4_FILE_INFO,
  id: new ObjectId().toString(),
  musicId: DRIFTVEIL.id,
  path: "Driftveil.mp3",
  hash: "4c8d3285f37bd9537e66fb8a4034edff",
  size: 10096359,
};
const AOT4_COPY_FILE_INFO: MusicFileInfoEntity = {
  id: new ObjectId().toString(),
  musicId: AOT4_COPY.id,
  hash: "132e004ea6dc462fb714ce4c66ec77b1",
  mediaInfo: {
    duration: 123,
  },
  path: "aot4_copy.mp3",
  size: 7614308,
  timestamps: fileInfoTimestamps,
};
const userInfoA_AOT4: MusicUserInfoEntity = {
  id: new ObjectId().toString(),
  userId: fixtureUsers.Normal.User.id,
  musicId: A_AOT4.id,
  lastTimePlayed: 0,
  weight: 11,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ["userTag"],
};
const userInfoAOT4_COPY: MusicUserInfoEntity = {
  id: new ObjectId().toString(),
  userId: fixtureUsers.Normal.User.id,
  musicId: AOT4_COPY.id,
  lastTimePlayed: 0,
  weight: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ["userTag"],
};
const userInfoDK: MusicUserInfoEntity = {
  id: new ObjectId().toString(),
  userId: fixtureUsers.Normal.User.id,
  musicId: DK.id,
  lastTimePlayed: 0,
  weight: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ["userTag"],
};
const userInfoDRIFTVEIL: MusicUserInfoEntity = {
  id: new ObjectId().toString(),
  userId: fixtureUsers.Normal.User.id,
  musicId: DRIFTVEIL.id,
  lastTimePlayed: 0,
  weight: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ["userTag"],
};
const sampleDate = {
  year: 2000,
  month: 1,
  day: 1,
  timestamp: dateToTimestampInSeconds(new Date(2000, 0, 1)),
};
const historyEntryNormal1: MusicHistoryEntryEntity = {
  id: new ObjectId().toString(),
  date: sampleDate,
  resourceId: DK.id,
  resource: DK,
  userId: fixtureUsers.Normal.User.id,
};
const historyEntryNormal2: MusicHistoryEntryEntity = {
  id: new ObjectId().toString(),
  date: sampleDate,
  resourceId: A_AOT4.id,
  resource: A_AOT4,
  userId: fixtureUsers.Normal.User.id,
};
const historyEntryAdmin1: MusicHistoryEntryEntity = {
  id: new ObjectId().toString(),
  date: sampleDate,
  resourceId: DRIFTVEIL.id,
  resource: DRIFTVEIL,
  userId: fixtureUsers.Admin.User.id,
};
const historyEntryAdmin2: MusicHistoryEntryEntity = {
  id: new ObjectId().toString(),
  date: sampleDate,
  resourceId: AOT4_COPY.id,
  resource: AOT4_COPY,
  userId: fixtureUsers.Admin.User.id,
};
const playlistNormal: MusicPlaylistEntity = {
  id: new ObjectId().toString(),
  name: "My Playlist",
  slug: "my-playlist",
  ownerUserId: fixtureUsers.Normal.User.id,
  visibility: "private",
  list: [
    {
      id: new ObjectId().toString(),
      musicId: A_AOT4.id,
      addedAt: new Date(),
      music: A_AOT4,
    },
    {
      id: new ObjectId().toString(),
      musicId: DK.id,
      addedAt: new Date(),
      music: DK,
    },
  ],
  ...timestamps,
};
const playlistAdmin: MusicPlaylistEntity = {
  id: new ObjectId().toString(),
  name: "Admin Playlist",
  slug: "admin-playlist",
  ownerUserId: fixtureUsers.Admin.User.id,
  visibility: "public",
  list: [
    {
      id: new ObjectId().toString(),
      musicId: DRIFTVEIL.id,
      addedAt: new Date(),
      music: DRIFTVEIL,
    },
  ],
  ...timestamps,
};
const smartPlaylistNormal: MusicSmartPlaylistEntity = {
  id: new ObjectId().toString(),
  name: "Smart Playlist",
  slug: "smart-playlist",
  query: "artist:artist",
  ownerUserId: fixtureUsers.Normal.User.id,
  visibility: "private",
  ...timestamps,
};
const smartPlaylistAdmin: MusicSmartPlaylistEntity = {
  id: new ObjectId().toString(),
  name: "Admin Smart Playlist",
  slug: "admin-smart-playlist",
  query: "tag:t1",
  ownerUserId: fixtureUsers.Admin.User.id,
  visibility: "public",
  ...timestamps,
};
const userListNormal: MusicUserListEntity = {
  id: new ObjectId().toString(),
  ownerUserId: fixtureUsers.Normal.User.id,
  list: [
    {
      id: new ObjectId().toString(),
      resourceId: playlistNormal.id,
      type: "playlist",
      resource: playlistNormal,
    },
    {
      id: new ObjectId().toString(),
      resourceId: smartPlaylistNormal.id,
      type: "smart-playlist",
      resource: smartPlaylistNormal,
    },
  ],
};
const ENTITIES = {
  A_AOT4: {
    music: A_AOT4,
    fileInfos: [A_AOT4_FILE_INFO],
  },
  AOT4_COPY: {
    music: AOT4_COPY,
    fileInfos: [AOT4_COPY_FILE_INFO],
  },
  DK: {
    music: DK,
    fileInfos: [DK_FILE_INFO],
  },
  DRIFTVEIL: {
    music: DRIFTVEIL,
    fileInfos: [DRIFTVEIL_FILE_INFO],
  },
} as const;
const samples = {
  A_AOT4,
  AOT4_COPY,
  DK,
  DRIFTVEIL,
} satisfies Record<string, MusicEntity>;
const samplesFileInfos = {
  A_AOT4: A_AOT4_FILE_INFO,
  AOT4_COPY: AOT4_COPY_FILE_INFO,
  DK: DK_FILE_INFO,
  DRIFTVEIL: DRIFTVEIL_FILE_INFO,
} satisfies Record<string, MusicFileInfoEntity>;
const userInfoSamples = {
  A_AOT4: userInfoA_AOT4,
  AOT4_COPY: userInfoAOT4_COPY,
  DK: userInfoDK,
  DRIFTVEIL: userInfoDRIFTVEIL,
} satisfies Record<string, MusicUserInfoEntity>;
const musicList = deepFreeze(Object.values(samples));
const fileInfoList = deepFreeze(Object.values(samplesFileInfos));
const userInfoList = deepFreeze(Object.values(userInfoSamples));
const musicsFullSamples = {
  A_AOT4: {
    ...A_AOT4,
    userInfo: userInfoA_AOT4,
    fileInfos: [A_AOT4_FILE_INFO],
  },
  AOT4_COPY: {
    ...AOT4_COPY,
    userInfo: userInfoAOT4_COPY,
    fileInfos: [AOT4_COPY_FILE_INFO],
  },
  DK: {
    ...DK,
    userInfo: userInfoDK,
    fileInfos: [DK_FILE_INFO],
  },
  DRIFTVEIL: {
    ...DRIFTVEIL,
    userInfo: userInfoDRIFTVEIL,
    fileInfos: [DRIFTVEIL_FILE_INFO],
  },
} satisfies Record<string, MusicEntity>;
const musicsFullList = deepFreeze(
  Object.values(musicsFullSamples),
) as WithRequired<MusicEntity, "fileInfos" | "userInfo">[];
const historyEntriesList = deepFreeze([
  historyEntryNormal1,
  historyEntryNormal2,
  historyEntryAdmin1,
  historyEntryAdmin2,
]);

export const fixtureMusics = {
  Entities: ENTITIES,
  List: Object.values(ENTITIES),
  Musics: {
    Samples: samples,
    List: musicList,
    FullSamples: musicsFullSamples,
    FullList: musicsFullList,
  },
  FileInfos: {
    Samples: samplesFileInfos,
    List: fileInfoList,
  },
  UserInfo: {
    Samples: userInfoSamples,
    List: userInfoList,
  },
  HistoryEntries: {
    List: historyEntriesList,
    ByUser: {
      Normal: deepFreeze([historyEntryNormal1, historyEntryNormal2]),
      Admin: deepFreeze([historyEntryAdmin1, historyEntryAdmin2]),
    },
  },
  Playlists: {
    Samples: {
      Normal: playlistNormal,
      Admin: playlistAdmin,
    },
    List: deepFreeze([playlistNormal, playlistAdmin]),
  },
  SmartPlaylists: {
    Samples: {
      Normal: smartPlaylistNormal,
      Admin: smartPlaylistAdmin,
    },
    List: deepFreeze([smartPlaylistNormal, smartPlaylistAdmin]),
  },
  UserLists: {
    Samples: {
      Normal: userListNormal,
    },
    List: deepFreeze([userListNormal]),
  },
};
