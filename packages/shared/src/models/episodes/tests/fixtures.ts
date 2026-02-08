/* eslint-disable @typescript-eslint/naming-convention */
import type { EpisodeEntity, EpisodeUserInfoEntity } from "../";
import { Types } from "mongoose";
import { deepFreeze } from "../../../utils/objects";
import { DATEJS_SAMPLE1 } from "../../../../tests/other-fixtures/dates";
import { fixtureEpisodeFileInfos } from "../file-info/tests";
import { fixtureUsers } from "../../auth/tests/fixtures";
import { SERIES_SAMPLE_SERIES, SERIES_SIMPSONS } from "../series/tests/fixtures";
import { simpsonIds, sampleSeriesIds } from "./fixture-ids";

const uploaderUserId = fixtureUsers.Admin.User.id;
const timestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
  addedAt: DATEJS_SAMPLE1,
};
const ep1x01: EpisodeEntity = {
  id: simpsonIds.ep1x01,
  episodeKey: "1x01",
  seriesId: SERIES_SIMPSONS.id,
  title: "Sin Blanca Navidad",
  tags: [
    "navidad",
  ],
  ...timestamps,
  fileInfos: [
    fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01,
  ],
  uploaderUserId,
};
const EP6x25: EpisodeEntity = {
  id: simpsonIds.ep6x25,
  title: "Quién disparó al señor Burns (1ª parte)",
  ...timestamps,
  episodeKey: "6x25",
  seriesId: SERIES_SIMPSONS.id,
  uploaderUserId,
};
const EP7x01: EpisodeEntity = {
  id: simpsonIds.ep7x01,
  title: "Quién disparó al señor Burns (2ª parte)",
  ...timestamps,
  episodeKey: "7x01",
  seriesId: SERIES_SIMPSONS.id,
  uploaderUserId,
};
// Episode entities
const EPISODES_SIMPSONS: EpisodeEntity[] = deepFreeze([
  ep1x01,
  {
    id: simpsonIds.ep1x02,
    episodeKey: "1x02",
    seriesId: SERIES_SIMPSONS.id,
    title: "Bart, el genio",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x03,
    episodeKey: "1x03",
    seriesId: SERIES_SIMPSONS.id,
    title: "La odisea de Homer",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x04,
    episodeKey: "1x04",
    seriesId: SERIES_SIMPSONS.id,
    title: "Hogar, agridulce hogar",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x05,
    episodeKey: "1x05",
    seriesId: SERIES_SIMPSONS.id,
    title: "Bart, el general",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x06,
    episodeKey: "1x06",
    seriesId: SERIES_SIMPSONS.id,
    title: "El blues de la Mona Lisa",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x07,
    episodeKey: "1x07",
    seriesId: SERIES_SIMPSONS.id,
    title: "El abominable hombre del bosque",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x08,
    episodeKey: "1x08",
    seriesId: SERIES_SIMPSONS.id,
    title: "La cabeza chiflada",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x09,
    episodeKey: "1x09",
    seriesId: SERIES_SIMPSONS.id,
    title: "Jacques, el rompecorazones",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x10,
    episodeKey: "1x10",
    seriesId: SERIES_SIMPSONS.id,
    title: "Homer se va de juerga",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x11,
    episodeKey: "1x11",
    seriesId: SERIES_SIMPSONS.id,
    title: "Viva la vendimia",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x12,
    episodeKey: "1x12",
    seriesId: SERIES_SIMPSONS.id,
    title: "Krusty entra en chirona",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  {
    id: simpsonIds.ep1x13,
    episodeKey: "1x13",
    seriesId: SERIES_SIMPSONS.id,
    title: "La baby siter ataca de nuevo",
    ...timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  EP6x25,
  EP7x01,
]);
const SampleSeriesEP1x01 = {
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
  id: sampleSeriesIds.ep1x01,
  episodeKey: "1x01",
  seriesId: SERIES_SAMPLE_SERIES.id,
  title: "Sample 1x01 Title",
  fileInfos: [
    fixtureEpisodeFileInfos.SampleSeries.Samples.EP1x01,
  ],
  uploaderUserId: fixtureUsers.Normal.User.id,
} satisfies EpisodeEntity;
const SampleSeriesEP1x02 = {
  ...SampleSeriesEP1x01,
  id: sampleSeriesIds.ep1x02,
  episodeKey: "1x02",
  seriesId: SERIES_SAMPLE_SERIES.id,
  title: "Sample 1x02 Title",
  fileInfos: [
    fixtureEpisodeFileInfos.SampleSeries.Samples.EP1x02,
  ],
} satisfies EpisodeEntity;
const SampleSeriesEP2x01 = {
  ...SampleSeriesEP1x01,
  id: sampleSeriesIds.ep2x01,
  episodeKey: "2x01",
  seriesId: SERIES_SAMPLE_SERIES.id,
  title: "Sample 2x01 Title",
  fileInfos: [
    fixtureEpisodeFileInfos.SampleSeries.Samples.EP2x01,
  ],
} satisfies EpisodeEntity;
const SAMPLE_SERIES_LIST = [
  SampleSeriesEP1x01,
  SampleSeriesEP1x02,
  SampleSeriesEP2x01,
];

export const fixtureEpisodes = {
  SampleSeries: {
    Samples: {
      EP1x01: SampleSeriesEP1x01,
      EP1x02: SampleSeriesEP1x02,
      EP2x01: SampleSeriesEP2x01,
    },
    List: SAMPLE_SERIES_LIST,
  },
  Simpsons: {
    Samples: {
      EP1x01: ep1x01,
      EP1x02: EPISODES_SIMPSONS[1],
      Dependency: {
        last: EP6x25,
        next: EP7x01,
      },
    },
    List: EPISODES_SIMPSONS,
    ListForUser: {
      NormalUser: EPISODES_SIMPSONS.map(e=>( {
        ...e,
        userInfo: {
          createdAt: new Date(),
          updatedAt: new Date(),
          episodeId: e.id,
          id: new Types.ObjectId().toString(),
          lastTimePlayed: new Date(0),
          userId: fixtureUsers.Normal.User.id,
          weight: 0,
        } satisfies EpisodeUserInfoEntity,
      } )),
    },
  },
};
