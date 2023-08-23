import { SerieWithEpisodes } from "#modules/seriesWithEpisodes";
import { deepFreeze } from "#utils/objects";
import { EPISODES_SIMPSONS } from "./episodes";
import { SERIE_SIMPSONS } from "./series";

export type SerieWithEpisodesFixture = SerieWithEpisodes;

export const initFixtures: SerieWithEpisodesFixture[] = deepFreeze([{
  ...SERIE_SIMPSONS,
  episodes: EPISODES_SIMPSONS,
}]);

export const newItem: SerieWithEpisodesFixture = deepFreeze( {
  id: "99",
  name: "label99",
  episodes: [],
} );
