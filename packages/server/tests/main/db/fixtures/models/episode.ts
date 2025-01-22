import { deepFreeze } from "#shared/utils/objects";
import { DATEJS_SAMPLE1 } from "./dates";
import { Episode } from "#modules/episodes";

const timestamps = {
  createdAt: DATEJS_SAMPLE1,
  updatedAt: DATEJS_SAMPLE1,
  addedAt: DATEJS_SAMPLE1,
};
const ep1x01: Episode = {
  id: {
    innerId: "1x01",
    serieId: "simpsons",
  },
  title: "Sin Blanca Navidad",
  path: "series/simpsons/1/1_80.mkv",
  weight: -6,
  start: 2,
  end: 1326,
  tags: [
    "navidad",
  ],
  timestamps,
};

export const EPISODES_SIMPSONS: Episode[] = deepFreeze([
  ep1x01,
  {
    id: {
      innerId: "1x02",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/2_80.mkv",
    title: "Bart, el genio",
    weight: -30,
    start: 90,
    end: 1337,
    timestamps,
  },
  {
    id: {
      innerId: "1x03",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/3_80.mkv",
    title: "La odisea de Homer",
    weight: -4,
    start: 90,
    end: 1320,
    timestamps,
  },
  {
    id: {
      innerId: "1x04",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/4_80.mkv",
    title: "Hogar, agridulce hogar",
    weight: -2,
    start: 90,
    end: 1277.5,
    timestamps,
  },
  {
    id: {
      innerId: "1x05",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/5_80.mkv",
    title: "Bart, el general",
    weight: -8,
    start: 11,
    end: 1289,
    timestamps,
  },
  {
    id: {
      innerId: "1x06",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/6_80.mkv",
    title: "El blues de la Mona Lisa",
    weight: 0,
    start: 89,
    end: 1316,
    timestamps,
  },
  {
    id: {
      innerId: "1x07",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/7_80_+cat.mkv",
    title: "El abominable hombre del bosque",
    weight: -8,
    start: 89.5,
    end: 1315,
    timestamps,
  },
  {
    id: {
      innerId: "1x08",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/8_80.mkv",
    title: "La cabeza chiflada",
    weight: -4,
    start: 88.5,
    end: 1307,
    timestamps,
  },
  {
    id: {
      innerId: "1x09",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/9_80.mkv",
    title: "Jacques, el rompecorazones",
    weight: -8,
    start: 13.5,
    end: 1333,
    timestamps,
  },
  {
    id: {
      innerId: "1x10",
      serieId: "simpsons",
    },
    path: "series/simpsons/1/10_80.mkv",
    title: "Homer se va de juerga",
    weight: -16,
    start: 90,
    end: 1331.5,
    timestamps,
  },
  {
    id: {
      innerId: "1x11",
      serieId: "simpsons",
    },
    title: "Viva la vendimia",
    path: "series/simpsons/1/11_80.mkv",
    weight: -8,
    start: 87,
    end: 1366,
    timestamps,
  },
  {
    id: {
      innerId: "1x12",
      serieId: "simpsons",
    },
    title: "Krusty entra en chirona",
    path: "series/simpsons/1/12_80.mkv",
    weight: 0,
    start: 86,
    end: 1381,
    timestamps,
  },
  {
    id: {
      innerId: "1x13",
      serieId: "simpsons",
    },
    title: "La baby siter ataca de nuevo",
    path: "series/simpsons/1/13_80.mkv",
    weight: -6,
    start: 87,
    end: 1366.5,
    timestamps,
  },
]);
