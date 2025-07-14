import { episodeToDocOdm } from "#episodes/index";
import { DocOdm, ModelOdm } from "#episodes/repositories";
import { SerieDocOdm, SerieModelOdm, serieEntityToDocOdm } from "#modules/series";
import { EPISODES_SIMPSONS, SERIE_SIMPSONS } from "../models";

export const loadFixtureSerieAndEpisodesSimpsons = async () => {
  // Series
  const seriesDocOdm: SerieDocOdm[] = [SERIE_SIMPSONS].map(serieEntityToDocOdm);

  await SerieModelOdm.insertMany(seriesDocOdm);

  // Episodes
  const episodesDocOdm: DocOdm[] = EPISODES_SIMPSONS.map(episodeToDocOdm);

  await ModelOdm.insertMany(episodesDocOdm);
};
