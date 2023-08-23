import { SerieWithEpisodesModelODM } from "#modules/seriesWithEpisodes/repositories";
import { serieWithEpisodesToSerieWithEpisodesDB } from "#modules/seriesWithEpisodes/repositories/adapters";
import { seriesWithEpisodesInitFixtures } from "../models";

export default async () => {
  await SerieWithEpisodesModelODM.deleteMany();
  const seriesWithEpisodesDB = seriesWithEpisodesInitFixtures.map(serieWithEpisodesToSerieWithEpisodesDB);

  await SerieWithEpisodesModelODM.insertMany(seriesWithEpisodesDB);
};