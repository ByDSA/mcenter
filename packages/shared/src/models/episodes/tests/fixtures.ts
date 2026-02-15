/* eslint-disable @typescript-eslint/naming-convention */
import type { EpisodeEntity, EpisodeUserInfoEntity } from "../";
import type { SeriesEntity } from "../series";
import type { EpisodeFileInfoEntity } from "../file-info";
import type { EpisodeHistoryEntryEntity } from "../history";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { deepFreeze, WithRequired } from "../../../utils/objects";
import { DATEJS_SAMPLE1 } from "../../../../tests/other-fixtures/dates";
import { fixtureUsers } from "../../auth/tests/fixtures";
import { fixtureImageCovers } from "../../image-covers/tests";
import { EpisodeDependencyEntity } from "../dependencies";
import { StreamEntity, StreamOriginType, StreamMode } from "../streams";

type EpisodeFull = WithRequired<EpisodeEntity, "fileInfos" | "userInfo">;

const timestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
  addedAt: DATEJS_SAMPLE1,
};
const fileInfoTimestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
};
const uploaderUserId = fixtureUsers.Admin.User.id;
const SERIES_SIMPSONS: SeriesEntity = deepFreeze( {
  id: new Types.ObjectId().toString(),
  key: "simpsons",
  name: "simpsons",
  imageCoverId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
} );
const SERIES_SAMPLE_SERIES: SeriesEntity = deepFreeze( {
  id: new Types.ObjectId().toString(),
  key: "sample-serie",
  name: "Sample Series",
  imageCoverId: fixtureImageCovers.Disk.Samples.NodeJs.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
} );
const STREAM_SIMPSONS: StreamEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: "simpsons",
  userId: fixtureUsers.Normal.User.id,
  group: {
    origins: [
      {
        type: StreamOriginType.SERIE,
        id: "simpsons",
      },
    ],
  },
  mode: StreamMode.RANDOM,
} satisfies StreamEntity);
const STREAM_SAMPLE: StreamEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: SERIES_SAMPLE_SERIES.key,
  userId: fixtureUsers.Normal.User.id,
  group: {
    origins: [
      {
        type: StreamOriginType.SERIE,
        id: SERIES_SAMPLE_SERIES.key,
      },
    ],
  },
  mode: StreamMode.RANDOM,
} satisfies StreamEntity);
const ep1x01: EpisodeEntity = {
  id: new Types.ObjectId().toString(),
  episodeKey: "1x01",
  seriesId: SERIES_SIMPSONS.id,
  title: "Sin Blanca Navidad",
  tags: ["navidad"],
  ...timestamps,
  uploaderUserId,
};
const EP6x25: EpisodeEntity = {
  id: new Types.ObjectId().toString(),
  title: "Quién disparó al señor Burns (1ª parte)",
  ...timestamps,
  episodeKey: "6x25",
  seriesId: SERIES_SIMPSONS.id,
  uploaderUserId,
};
const EP7x01: EpisodeEntity = {
  id: new Types.ObjectId().toString(),
  title: "Quién disparó al señor Burns (2ª parte)",
  ...timestamps,
  episodeKey: "7x01",
  seriesId: SERIES_SIMPSONS.id,
  uploaderUserId,
};
const EPISODES_SIMPSONS: EpisodeEntity[] = deepFreeze([
  ep1x01,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x02",
    seriesId: SERIES_SIMPSONS.id,
    title: "Bart, el genio",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x03",
    seriesId: SERIES_SIMPSONS.id,
    title: "La odisea de Homer",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x04",
    seriesId: SERIES_SIMPSONS.id,
    title: "Hogar, agridulce hogar",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x05",
    seriesId: SERIES_SIMPSONS.id,
    title: "Bart, el general",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x06",
    seriesId: SERIES_SIMPSONS.id,
    title: "El blues de la Mona Lisa",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x07",
    seriesId: SERIES_SIMPSONS.id,
    title: "El abominable hombre del bosque",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x08",
    seriesId: SERIES_SIMPSONS.id,
    title: "La cabeza chiflada",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x09",
    seriesId: SERIES_SIMPSONS.id,
    title: "Jacques, el rompecorazones",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x10",
    seriesId: SERIES_SIMPSONS.id,
    title: "Homer se va de juerga",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x11",
    seriesId: SERIES_SIMPSONS.id,
    title: "Viva la vendimia",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x12",
    seriesId: SERIES_SIMPSONS.id,
    title: "Krusty entra en chirona",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    episodeKey: "1x13",
    seriesId: SERIES_SIMPSONS.id,
    title: "La baby siter ataca de nuevo",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  EP6x25,
  EP7x01,
]);
const SampleSeriesEP1x01: EpisodeEntity = {
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
  id: new Types.ObjectId().toString(),
  episodeKey: "1x01",
  seriesId: SERIES_SAMPLE_SERIES.id,
  title: "Sample 1x01 Title",
  uploaderUserId: fixtureUsers.Normal.User.id,
} satisfies EpisodeEntity;
const SampleSeriesEP1x02: EpisodeEntity = {
  ...SampleSeriesEP1x01,
  id: new Types.ObjectId().toString(),
  episodeKey: "1x02",
  seriesId: SERIES_SAMPLE_SERIES.id,
  title: "Sample 1x02 Title",
} satisfies EpisodeEntity;
const SampleSeriesEP2x01: EpisodeEntity = {
  ...SampleSeriesEP1x01,
  id: new Types.ObjectId().toString(),
  episodeKey: "2x01",
  seriesId: SERIES_SAMPLE_SERIES.id,
  title: "Sample 2x01 Title",
} satisfies EpisodeEntity;
const SAMPLE_SERIES_LIST: EpisodeEntity[] = deepFreeze([
  SampleSeriesEP1x01,
  SampleSeriesEP1x02,
  SampleSeriesEP2x01,
]);
const ep1x01FileInfo: EpisodeFileInfoEntity = {
  id: new Types.ObjectId().toString(),
  path: "simpsons/1/1_80.mkv",
  start: 2,
  end: 1326,
  episodeId: ep1x01.id,
  timestamps: fileInfoTimestamps,
  hash: "0000000000000ba9609f7e03be016cb1",
  size: 11,
  mediaInfo: {
    duration: 123,
    fps: "24",
    resolution: {
      width: 1440,
      height: 1080,
    },
  },
} satisfies EpisodeFileInfoEntity;
const FILE_INFOS_SIMPSONS: EpisodeFileInfoEntity[] = deepFreeze([
  ep1x01FileInfo,
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[1].id,
    path: "simpsons/1/2_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[2].id,
    path: "simpsons/1/3_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[3].id,
    path: "simpsons/1/4_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[4].id,
    path: "simpsons/1/5_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[5].id,
    path: "simpsons/1/6_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[6].id,
    path: "simpsons/1/7_80_+cat.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[7].id,
    path: "simpsons/1/8_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[8].id,
    path: "simpsons/1/9_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[9].id,
    path: "simpsons/1/10_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[10].id,
    path: "simpsons/1/11_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[11].id,
    path: "simpsons/1/12_80.mkv",
  },
  {
    ...ep1x01FileInfo,
    id: new Types.ObjectId().toString(),
    episodeId: EPISODES_SIMPSONS[12].id,
    path: "simpsons/1/13_80.mkv",
  },
]);
const sampleSerieEp1x01FileInfo: EpisodeFileInfoEntity = {
  id: new Types.ObjectId().toString(),
  path: "sample-serie/1/sample-1x01.mp4",
  episodeId: SampleSeriesEP1x01.id,
  timestamps: fileInfoTimestamps,
  hash: "8f247ad75542bba9609f7e03be016cb1",
  size: 5217,
  mediaInfo: {
    duration: 0.5,
    fps: "25",
    resolution: {
      width: 640,
      height: 480,
    },
  },
} satisfies EpisodeFileInfoEntity;
const sampleSerieEp1x02FileInfo: EpisodeFileInfoEntity = {
  id: new Types.ObjectId().toString(),
  path: "sample-serie/1/sample-1x02.mp4",
  episodeId: SampleSeriesEP1x02.id,
  timestamps: fileInfoTimestamps,
  hash: "dc3ea225ae44cb1f87d315ce3bf1ae28",
  size: 5217,
  mediaInfo: {
    duration: 0.501,
    fps: "25",
    resolution: {
      width: 640,
      height: 480,
    },
  },
} satisfies EpisodeFileInfoEntity;
const sampleSerieEp2x01FileInfo: EpisodeFileInfoEntity = {
  id: new Types.ObjectId().toString(),
  path: "sample-serie/2/sample-2x01.mp4",
  episodeId: SampleSeriesEP2x01.id,
  timestamps: fileInfoTimestamps,
  hash: "91887ed09d8f79d476199a8df47b7294",
  size: 5217,
  mediaInfo: {
    duration: 0.502,
    fps: "25",
    resolution: {
      width: 640,
      height: 480,
    },
  },
} satisfies EpisodeFileInfoEntity;
const FILE_INFOS_SAMPLE_SERIES: EpisodeFileInfoEntity[] = deepFreeze([
  sampleSerieEp1x01FileInfo,
  sampleSerieEp1x02FileInfo,
  sampleSerieEp2x01FileInfo,
]);
const userInfoEp1x01: EpisodeUserInfoEntity = {
  id: new Types.ObjectId().toString(),
  episodeId: ep1x01.id,
  userId: fixtureUsers.Normal.User.id,
  lastTimePlayed: new Date(0),
  weight: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies EpisodeUserInfoEntity;
const userInfoEp6x25: EpisodeUserInfoEntity = {
  id: new Types.ObjectId().toString(),
  episodeId: EP6x25.id,
  userId: fixtureUsers.Normal.User.id,
  lastTimePlayed: new Date(0),
  weight: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies EpisodeUserInfoEntity;
const userInfoSampleSeriesEP1x01: EpisodeUserInfoEntity = {
  id: new Types.ObjectId().toString(),
  episodeId: SampleSeriesEP1x01.id,
  userId: fixtureUsers.Normal.User.id,
  lastTimePlayed: new Date(0),
  weight: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies EpisodeUserInfoEntity;
const USER_INFO_SIMPSONS: EpisodeUserInfoEntity[] = deepFreeze([
  userInfoEp1x01,
  userInfoEp6x25,
]);
const USER_INFO_SAMPLE_SERIES: EpisodeUserInfoEntity[] = deepFreeze([
  userInfoSampleSeriesEP1x01,
]);
const historyEntryEp1x01: EpisodeHistoryEntryEntity = {
  id: new Types.ObjectId().toString(),
  resourceId: ep1x01.id,
  date: DATEJS_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
  userId: fixtureUsers.Normal.User.id,
} satisfies EpisodeHistoryEntryEntity;
const historyEntryEp6x25: EpisodeHistoryEntryEntity = {
  id: new Types.ObjectId().toString(),
  resourceId: EP6x25.id,
  date: DATEJS_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
  userId: fixtureUsers.Normal.User.id,
} satisfies EpisodeHistoryEntryEntity;
const historyEntrySampleSeriesEP1x01: EpisodeHistoryEntryEntity = {
  id: new Types.ObjectId().toString(),
  resourceId: SampleSeriesEP1x01.id,
  date: DATEJS_SAMPLE1,
  streamId: STREAM_SAMPLE.id,
  userId: fixtureUsers.Normal.User.id,
} satisfies EpisodeHistoryEntryEntity;
const HISTORY_ENTRIES_SIMPSONS: EpisodeHistoryEntryEntity[] = deepFreeze([
  historyEntryEp1x01,
  historyEntryEp6x25,
]);
const HISTORY_ENTRIES_SAMPLE_SERIES: EpisodeHistoryEntryEntity[] = deepFreeze([
  historyEntrySampleSeriesEP1x01,
]);
const episodesSamples = {
  Simpsons: {
    EP1x01: ep1x01,
    EP1x02: EPISODES_SIMPSONS[1],
    EP6x25,
    EP7x01,
  },
  SampleSeries: {
    EP1x01: SampleSeriesEP1x01,
    EP1x02: SampleSeriesEP1x02,
    EP2x01: SampleSeriesEP2x01,
  },
} satisfies Record<string, Record<string, EpisodeEntity |
  { last: EpisodeEntity;
next: EpisodeEntity; }>>;
const fileInfosSamples = {
  Simpsons: {
    EP1x01: ep1x01FileInfo,
    EP1x02: FILE_INFOS_SIMPSONS[1],
  },
  SampleSeries: {
    EP1x01: sampleSerieEp1x01FileInfo,
    EP1x02: sampleSerieEp1x02FileInfo,
    EP2x01: sampleSerieEp2x01FileInfo,
  },
} satisfies Record<string, Record<string, EpisodeFileInfoEntity>>;
const userInfoSamples = {
  Simpsons: {
    EP1x01: userInfoEp1x01,
    EP6x25: userInfoEp6x25,
  },
  SampleSeries: {
    EP1x01: userInfoSampleSeriesEP1x01,
  },
} satisfies Record<string, Record<string, EpisodeUserInfoEntity>>;
const episodeList = deepFreeze([
  ...EPISODES_SIMPSONS,
  ...SAMPLE_SERIES_LIST,
]);
const fileInfoList = deepFreeze([
  ...FILE_INFOS_SIMPSONS,
  ...FILE_INFOS_SAMPLE_SERIES,
]);
const userInfoList = deepFreeze([
  ...USER_INFO_SIMPSONS,
  ...USER_INFO_SAMPLE_SERIES,
]);
const historyEntriesList = deepFreeze([
  ...HISTORY_ENTRIES_SIMPSONS,
  ...HISTORY_ENTRIES_SAMPLE_SERIES,
]);
const episodesFullSamples = {
  Simpsons: {
    EP1x01: {
      ...ep1x01,
      series: SERIES_SIMPSONS,
      fileInfos: [ep1x01FileInfo],
      userInfo: userInfoEp1x01,
    },
    EP1x02: {
      ...EPISODES_SIMPSONS[1],
      series: SERIES_SIMPSONS,
    },
    EP6x25: {
      ...EP6x25,
      series: SERIES_SIMPSONS,
      userInfo: userInfoEp6x25,
    },
    EP7x01: {
      ...EP7x01,
      series: SERIES_SIMPSONS,
    },
  },
  SampleSeries: {
    EP1x01: {
      ...SampleSeriesEP1x01,
      series: SERIES_SAMPLE_SERIES,
      fileInfos: [sampleSerieEp1x01FileInfo],
      userInfo: userInfoSampleSeriesEP1x01,
    },
    EP1x02: {
      ...SampleSeriesEP1x02,
      series: SERIES_SAMPLE_SERIES,
      fileInfos: [sampleSerieEp1x02FileInfo],
    },
    EP2x01: {
      ...SampleSeriesEP2x01,
      series: SERIES_SAMPLE_SERIES,
      fileInfos: [sampleSerieEp2x01FileInfo],
    },
  },
} satisfies Record<string, Record<string, EpisodeEntity>>;
const episodesFullList = deepFreeze(
  Object.values(episodesFullSamples).flatMap(s => Object.values(s)),
) as WithRequired<EpisodeEntity, "series">[];
const seriesList = deepFreeze([
  SERIES_SIMPSONS,
  SERIES_SAMPLE_SERIES,
]);
const episodesBySeries = {
  Simpsons: {
    Episodes: deepFreeze([...EPISODES_SIMPSONS]),
    FileInfos: deepFreeze([...FILE_INFOS_SIMPSONS]),
    UserInfo: deepFreeze([...USER_INFO_SIMPSONS]),
    HistoryEntries: deepFreeze([...HISTORY_ENTRIES_SIMPSONS]),
  },
  SampleSeries: {
    Episodes: deepFreeze([...SAMPLE_SERIES_LIST]),
    FileInfos: deepFreeze([...FILE_INFOS_SAMPLE_SERIES]),
    UserInfo: deepFreeze([...USER_INFO_SAMPLE_SERIES]),
    HistoryEntries: deepFreeze([...HISTORY_ENTRIES_SAMPLE_SERIES]),
  },
} as const;
const DEPENDENCY_SIMPSONS: EpisodeDependencyEntity = deepFreeze( {
  id: new ObjectId().toString(),
  lastEpisodeId: episodesSamples.Simpsons.EP6x25.id, // 6x25
  nextEpisodeId: episodesSamples.Simpsons.EP7x01.id, // 7x01
} satisfies EpisodeDependencyEntity);

export const fixtureEpisodes = {
  Episodes: {
    Samples: episodesSamples,
    List: episodeList,
    FullSamples: episodesFullSamples,
    FullList: episodesFullList,
  },
  FileInfos: {
    Samples: fileInfosSamples,
    List: fileInfoList,
  },
  UserInfo: {
    Samples: userInfoSamples,
    List: userInfoList,
  },
  Dependencies: {
    List: [DEPENDENCY_SIMPSONS],
  },
  HistoryEntries: {
    List: historyEntriesList,
  },
  Streams: {
    Samples: {
      Simpsons: STREAM_SIMPSONS,
      SampleSeries: STREAM_SAMPLE,
    },
    List: [
      STREAM_SAMPLE,
      STREAM_SIMPSONS,
    ],
  },
  Series: {
    Samples: {
      Simpsons: SERIES_SIMPSONS,
      SampleSeries: SERIES_SAMPLE_SERIES,
    },
    List: seriesList,
  },
  Simpsons: {
    Series: SERIES_SIMPSONS,
    ...episodesBySeries.Simpsons,
    Episodes: {
      Samples: episodesSamples.Simpsons,
      List: episodesBySeries.Simpsons.Episodes,
      FullSamples: episodesFullSamples.Simpsons,
      FullList: deepFreeze(Object.values(episodesFullSamples.Simpsons)) as EpisodeFull[],
      Dependencies: {
        Sample: DEPENDENCY_SIMPSONS,
      },
    },
    HistoryEntries: {
      Samples: {
        EP1x01: HISTORY_ENTRIES_SIMPSONS.find(
          h => h.resourceId === episodesSamples.Simpsons.EP1x01.id,
        )!,
        EP6x25: HISTORY_ENTRIES_SIMPSONS.find(
          h => h.resourceId === episodesSamples.Simpsons.EP6x25.id,
        )!,
      } satisfies Record<string, EpisodeHistoryEntryEntity>,
      List: HISTORY_ENTRIES_SIMPSONS as EpisodeHistoryEntryEntity[],
    },
  },
  SampleSeries: {
    Series: SERIES_SAMPLE_SERIES,
    ...episodesBySeries.SampleSeries,
    Episodes: {
      Samples: episodesSamples.SampleSeries,
      List: episodesBySeries.SampleSeries.Episodes,
      FullSamples: episodesFullSamples.SampleSeries,
      FullList: deepFreeze(Object.values(episodesFullSamples.SampleSeries)),
    },
    HistoryEntries: {
      Samples: {
        EP1x01: HISTORY_ENTRIES_SAMPLE_SERIES.find(
          h => h.resourceId === episodesSamples.SampleSeries.EP1x01.id,
        )!,
      } satisfies Record<string, EpisodeHistoryEntryEntity>,
      List: historyEntriesList as EpisodeHistoryEntryEntity[],
    },
  },
};
