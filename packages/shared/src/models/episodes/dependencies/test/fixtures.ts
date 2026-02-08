import { ObjectId } from "mongodb";
import { EpisodeDependencyEntity } from "../dependency";
import { deepFreeze } from "../../../../utils/objects";
import { fixtureEpisodes } from "../../tests";

export const DEPENDENCY_SIMPSONS: EpisodeDependencyEntity = deepFreeze( {
  id: new ObjectId().toString(),
  lastEpisodeId: fixtureEpisodes.Simpsons.Samples.Dependency.last.id, // 6x25
  nextEpisodeId: fixtureEpisodes.Simpsons.Samples.Dependency.next.id, // 7x01
} satisfies EpisodeDependencyEntity);
