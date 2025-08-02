import { ObjectId } from "mongodb";
import { EpisodeDependencyEntity } from "../dependency";
import { deepFreeze } from "../../../../utils/objects";

export const DEPENDENCY_SIMPSONS: EpisodeDependencyEntity = deepFreeze( {
  id: new ObjectId().toString(),
  lastCompKey: {
    seriesKey: "simpsons",
    episodeKey: "6x25",
  },
  nextCompKey: {
    seriesKey: "simpsons",
    episodeKey: "7x01",
  },
} satisfies EpisodeDependencyEntity);
