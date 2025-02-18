import { loadFixtureSerieAndEpisodesSimpsons } from "./SerieAndEpisodesSimpsons";
import { loadFixtureStreamAndHistoryListSimpsons } from "./StreamAndHistoryListSimpsons";

export const loadFixtureSimpsons = async () => {
  await loadFixtureSerieAndEpisodesSimpsons();
  await loadFixtureStreamAndHistoryListSimpsons();
};
