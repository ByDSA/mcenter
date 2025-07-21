import type { EpisodeEntity } from "#episodes/models";
import { deepFreeze } from "$shared/utils/objects";
import { Types } from "mongoose";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { DATEJS_SAMPLE1 } from "./dates";
import { generateRandomMD5 } from "./hash";

const timestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
  addedAt: DATEJS_SAMPLE1,
};
const fileInfoTimestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
};
const ep1x01: EpisodeEntity = {
  id: new Types.ObjectId().toString(),
  compKey: {
    episodeKey: "1x01",
    seriesKey: "simpsons",
  },
  title: "Sin Blanca Navidad",
  weight: -6,
  tags: [
    "navidad",
  ],
  timestamps,
};
const ep1x01FileInfo: EpisodeFileInfoEntity = {
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/1_80.mkv",
  start: 2,
  end: 1326,
  episodeId: ep1x01.id,
  timestamps: fileInfoTimestamps,
  hash: generateRandomMD5(),
  size: 1234,
  mediaInfo: {
    duration: 123,
    fps: "24",
    resolution: {
      width: 1440,
      height: 1080,
    },
  },
} satisfies EpisodeFileInfoEntity;
// FileInfo entities
const ep1x02FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/2_80.mkv",
  start: 90,
  end: 1337,
  hash: generateRandomMD5(),
};
const ep1x03FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/3_80.mkv",
  start: 90,
  end: 1320,
  hash: generateRandomMD5(),
};
const ep1x04FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/4_80.mkv",
  start: 90,
  end: 1277.5,
  hash: generateRandomMD5(),
};
const ep1x05FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/5_80.mkv",
  start: 11,
  end: 1289,
  hash: generateRandomMD5(),
};
const ep1x06FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/6_80.mkv",
  start: 89,
  end: 1316,
  hash: generateRandomMD5(),
};
const ep1x07FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/7_80_+cat.mkv",
  start: 89.5,
  end: 1315,
  hash: generateRandomMD5(),
};
const ep1x08FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/8_80.mkv",
  start: 88.5,
  end: 1307,
  hash: generateRandomMD5(),
};
const ep1x09FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/9_80.mkv",
  start: 13.5,
  end: 1333,
  hash: generateRandomMD5(),
};
const ep1x10FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/10_80.mkv",
  start: 90,
  end: 1331.5,
  hash: generateRandomMD5(),
};
const ep1x11FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/11_80.mkv",
  start: 87,
  end: 1366,
  hash: generateRandomMD5(),
};
const ep1x12FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/12_80.mkv",
  start: 86,
  end: 1381,
  hash: generateRandomMD5(),
};
const ep1x13FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new Types.ObjectId().toString(),
  path: "series/simpsons/1/13_80.mkv",
  start: 87,
  end: 1366.5,
  hash: generateRandomMD5(),
} satisfies EpisodeFileInfoEntity;
const EPISODE_FILE_INFO_SIMPSONS: EpisodeFileInfoEntity[] = deepFreeze([
  ep1x01FileInfo,
  ep1x02FileInfo,
  ep1x03FileInfo,
  ep1x04FileInfo,
  ep1x05FileInfo,
  ep1x06FileInfo,
  ep1x07FileInfo,
  ep1x08FileInfo,
  ep1x09FileInfo,
  ep1x10FileInfo,
  ep1x11FileInfo,
  ep1x12FileInfo,
  ep1x13FileInfo,
]);
// Episode entities
const EPISODES_SIMPSONS: EpisodeEntity[] = deepFreeze([
  ep1x01,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x02",
      seriesKey: "simpsons",
    },
    title: "Bart, el genio",
    weight: -30,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x03",
      seriesKey: "simpsons",
    },
    title: "La odisea de Homer",
    weight: -4,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x04",
      seriesKey: "simpsons",
    },
    title: "Hogar, agridulce hogar",
    weight: -2,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x05",
      seriesKey: "simpsons",
    },
    title: "Bart, el general",
    weight: -8,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x06",
      seriesKey: "simpsons",
    },
    title: "El blues de la Mona Lisa",
    weight: 0,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x07",
      seriesKey: "simpsons",
    },
    title: "El abominable hombre del bosque",
    weight: -8,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x08",
      seriesKey: "simpsons",
    },
    title: "La cabeza chiflada",
    weight: -4,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x09",
      seriesKey: "simpsons",
    },
    title: "Jacques, el rompecorazones",
    weight: -8,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x10",
      seriesKey: "simpsons",
    },
    title: "Homer se va de juerga",
    weight: -16,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x11",
      seriesKey: "simpsons",
    },
    title: "Viva la vendimia",
    weight: -8,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x12",
      seriesKey: "simpsons",
    },
    title: "Krusty entra en chirona",
    weight: 0,
    timestamps,
  } as EpisodeEntity,
  {
    id: new Types.ObjectId().toString(),
    compKey: {
      episodeKey: "1x13",
      seriesKey: "simpsons",
    },
    title: "La baby siter ataca de nuevo",
    weight: -6,
    timestamps,
  } as EpisodeEntity,
]);

export const fixtureEpisodes = {
  Simpsons: {
    Samples: {
      EP1x01: ep1x01,
      EP1x02: EPISODES_SIMPSONS[1],
    },
    List: EPISODES_SIMPSONS,
  },
};

export const fixtureEpisodeFileInfos = {
  Simpsons: {
    Samples: {
      EP1x01: EPISODE_FILE_INFO_SIMPSONS[0],
      EP1x02: EPISODE_FILE_INFO_SIMPSONS[1],
    },
    List: EPISODE_FILE_INFO_SIMPSONS,
  },
};
