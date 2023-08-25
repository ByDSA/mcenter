import { loadFixtureSerieAndEpisodesSimpsons, loadFixtureStreamAndHistoryListSimpsons } from ".";

export default async () => {
  await loadFixtureSerieAndEpisodesSimpsons();
  await loadFixtureStreamAndHistoryListSimpsons();
};