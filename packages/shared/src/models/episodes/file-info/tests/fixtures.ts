import type { EpisodeFileInfoEntity } from "../file-info";
import { ObjectId } from "mongodb";
import { deepFreeze } from "../../../../utils/objects";
import { DATEJS_SAMPLE1 } from "../../../../../tests/other-fixtures/dates";
import { generateRandomMD5 } from "../../../../../tests/other-fixtures/hash";
import { sampleSeriesIds, simpsonIds } from "../../tests/fixture-ids";

const fileInfoTimestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
};
const ep1x01FileInfo: EpisodeFileInfoEntity = {
  id: new ObjectId().toString(),
  path: "series/simpsons/1/1_80.mkv",
  start: 2,
  end: 1326,
  episodeId: simpsonIds.ep1x01,
  timestamps: fileInfoTimestamps,
  hash: generateRandomMD5(),
  size: 11, // fake video
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
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x02,
  path: "series/simpsons/1/2_80.mkv",
  start: 90,
  end: 1337,
  hash: generateRandomMD5(),
};
const ep1x03FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x03,
  path: "series/simpsons/1/3_80.mkv",
  start: 90,
  end: 1320,
  hash: generateRandomMD5(),
};
const ep1x04FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x04,
  path: "series/simpsons/1/4_80.mkv",
  start: 90,
  end: 1277.5,
  hash: generateRandomMD5(),
};
const ep1x05FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x05,
  path: "series/simpsons/1/5_80.mkv",
  start: 11,
  end: 1289,
  hash: generateRandomMD5(),
};
const ep1x06FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x06,
  path: "series/simpsons/1/6_80.mkv",
  start: 89,
  end: 1316,
  hash: generateRandomMD5(),
};
const ep1x07FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x07,
  path: "series/simpsons/1/7_80_+cat.mkv",
  start: 89.5,
  end: 1315,
  hash: generateRandomMD5(),
};
const ep1x08FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x08,
  path: "series/simpsons/1/8_80.mkv",
  start: 88.5,
  end: 1307,
  hash: generateRandomMD5(),
};
const ep1x09FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x09,
  path: "series/simpsons/1/9_80.mkv",
  start: 13.5,
  end: 1333,
  hash: generateRandomMD5(),
};
const ep1x10FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x10,
  path: "series/simpsons/1/10_80.mkv",
  start: 90,
  end: 1331.5,
  hash: generateRandomMD5(),
};
const ep1x11FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x11,
  path: "series/simpsons/1/11_80.mkv",
  start: 87,
  end: 1366,
  hash: generateRandomMD5(),
};
const ep1x12FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x12,
  path: "series/simpsons/1/12_80.mkv",
  start: 86,
  end: 1381,
  hash: generateRandomMD5(),
};
const ep1x13FileInfo: EpisodeFileInfoEntity = {
  ...ep1x01FileInfo,
  id: new ObjectId().toString(),
  episodeId: simpsonIds.ep1x13,
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
const sampleSerieEp1x01FileInfo: EpisodeFileInfoEntity = {
  id: new ObjectId().toString(),
  path: "series/sample-serie/1/sample-1x01.mp4",
  episodeId: sampleSeriesIds.ep1x01,
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
  id: new ObjectId().toString(),
  path: "series/sample-serie/1/sample-1x02.mp4",
  episodeId: sampleSeriesIds.ep1x02,
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
  id: new ObjectId().toString(),
  path: "series/sample-serie/2/sample-2x01.mp4",
  episodeId: sampleSeriesIds.ep1x02,
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

export const fixtureEpisodeFileInfos = {
  SampleSeries: {
    Samples: {
      EP1x01: sampleSerieEp1x01FileInfo,
      EP1x02: sampleSerieEp1x02FileInfo,
      EP2x01: sampleSerieEp2x01FileInfo,
    },
    List: [
      sampleSerieEp1x01FileInfo,
      sampleSerieEp1x02FileInfo,
    ],
  },
  Simpsons: {
    Samples: {
      EP1x01: EPISODE_FILE_INFO_SIMPSONS[0],
      EP1x02: EPISODE_FILE_INFO_SIMPSONS[1],
    },
    List: EPISODE_FILE_INFO_SIMPSONS,
  },
};
