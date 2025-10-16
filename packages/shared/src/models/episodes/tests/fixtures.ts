/* eslint-disable @typescript-eslint/naming-convention */
import type { EpisodeEntity } from "../";
import { deepFreeze } from "../../../utils/objects";
import { DATEJS_SAMPLE1 } from "../../../../tests/other-fixtures/dates";
import { fixtureEpisodeFileInfos } from "../file-info/tests";
import { fixtureUsers } from "../../auth/tests/fixtures";
import { simpsonIds } from "./fixture-ids";

const uploaderUserId = fixtureUsers.Admin.User.id;
const timestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
  addedAt: DATEJS_SAMPLE1,
};
const ep1x01: EpisodeEntity = {
  id: simpsonIds.ep1x01,
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
  fileInfos: [
    fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01,
  ],
  uploaderUserId,
};
const EP6x25: EpisodeEntity = {
  id: simpsonIds.ep6x25,
  title: "Quién disparó al señor Burns (1ª parte)",
  weight: 4,
  timestamps,
  compKey: {
    episodeKey: "6x25",
    seriesKey: "simpsons",
  },
  uploaderUserId,
};
const EP7x01: EpisodeEntity = {
  id: simpsonIds.ep7x01,
  title: "Quién disparó al señor Burns (2ª parte)",
  weight: 4,
  timestamps,
  compKey: {
    episodeKey: "7x01",
    seriesKey: "simpsons",
  },
  uploaderUserId,
};
// Episode entities
const EPISODES_SIMPSONS: EpisodeEntity[] = deepFreeze([
  ep1x01,
  {
    id: simpsonIds.ep1x02,
    compKey: {
      episodeKey: "1x02",
      seriesKey: "simpsons",
    },
    title: "Bart, el genio",
    weight: -30,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x03,
    compKey: {
      episodeKey: "1x03",
      seriesKey: "simpsons",
    },
    title: "La odisea de Homer",
    weight: -4,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x04,
    compKey: {
      episodeKey: "1x04",
      seriesKey: "simpsons",
    },
    title: "Hogar, agridulce hogar",
    weight: -2,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x05,
    compKey: {
      episodeKey: "1x05",
      seriesKey: "simpsons",
    },
    title: "Bart, el general",
    weight: -8,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x06,
    compKey: {
      episodeKey: "1x06",
      seriesKey: "simpsons",
    },
    title: "El blues de la Mona Lisa",
    weight: 0,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x07,
    compKey: {
      episodeKey: "1x07",
      seriesKey: "simpsons",
    },
    title: "El abominable hombre del bosque",
    weight: -8,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x08,
    compKey: {
      episodeKey: "1x08",
      seriesKey: "simpsons",
    },
    title: "La cabeza chiflada",
    weight: -4,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x09,
    compKey: {
      episodeKey: "1x09",
      seriesKey: "simpsons",
    },
    title: "Jacques, el rompecorazones",
    weight: -8,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x10,
    compKey: {
      episodeKey: "1x10",
      seriesKey: "simpsons",
    },
    title: "Homer se va de juerga",
    weight: -16,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x11,
    compKey: {
      episodeKey: "1x11",
      seriesKey: "simpsons",
    },
    title: "Viva la vendimia",
    weight: -8,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x12,
    compKey: {
      episodeKey: "1x12",
      seriesKey: "simpsons",
    },
    title: "Krusty entra en chirona",
    weight: 0,
    timestamps,
    uploaderUserId,
  } as EpisodeEntity,
  {
    id: simpsonIds.ep1x13,
    compKey: {
      episodeKey: "1x13",
      seriesKey: "simpsons",
    },
    title: "La baby siter ataca de nuevo",
    weight: -6,
    timestamps,
    uploaderUserId,
  } satisfies EpisodeEntity,
  EP6x25,
  EP7x01,
]);

export const fixtureEpisodes = {
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
  },
};
