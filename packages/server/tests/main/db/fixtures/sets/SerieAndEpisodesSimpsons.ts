import { episodeEntityToDocOdm } from "#episodes/repositories/adapters";
import { EpisodeDocOdm, EpisodeModelOdm } from "#episodes/repositories";
import { SerieDocOdm, SerieModelOdm, serieEntityToDocOdm } from "#modules/series/repositories/odm";
import { EPISODES_SIMPSONS, SERIE_SIMPSONS } from "../models";

export const loadFixtureSerieAndEpisodesSimpsons = async () => {
  // Series
  const seriesDocOdm: SerieDocOdm[] = [SERIE_SIMPSONS].map(serieEntityToDocOdm);

  await SerieModelOdm.insertMany(seriesDocOdm);

  // Episodes
  const episodesDocOdm: EpisodeDocOdm[] = EPISODES_SIMPSONS.map(episodeEntityToDocOdm);

  await EpisodeModelOdm.insertMany(episodesDocOdm);
};
