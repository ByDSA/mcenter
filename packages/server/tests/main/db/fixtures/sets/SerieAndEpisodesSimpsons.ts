import { EPISODES_SIMPSONS, SERIE_SIMPSONS } from "../models";
import { episodeToDocOdm } from "#episodes/index";
import { DocOdm, ModelOdm } from "#episodes/repositories";
import { SerieDocOdm, SerieModelOdm, serieToDocOdm } from "#modules/series";

export const loadFixtureSerieAndEpisodesSimpsons = async () => {
  // Series
  const seriesDocOdm: SerieDocOdm[] = [SERIE_SIMPSONS].map(serieToDocOdm);

  await SerieModelOdm.insertMany(seriesDocOdm);

  // Episodes
  const episodesDocOdm: DocOdm[] = EPISODES_SIMPSONS.map(episodeToDocOdm);

  await ModelOdm.insertMany(episodesDocOdm);
};
