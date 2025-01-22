import loadFixtureSerieAndEpisodesSimpsons from "./SerieAndEpisodesSimpsons";
import loadFixtureStreamAndHistoryListSimpsons from "./StreamAndHistoryListSimpsons";

export default async () => {
  await loadFixtureSerieAndEpisodesSimpsons();
  await loadFixtureStreamAndHistoryListSimpsons();
};
