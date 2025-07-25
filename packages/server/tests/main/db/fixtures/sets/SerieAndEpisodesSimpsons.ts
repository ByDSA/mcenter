import { SeriesOdm } from "#modules/series/repositories/odm";
import { EpisodeFileInfoOdm } from "#episodes/file-info/repositories/odm";
import { EpisodeOdm } from "#episodes/repositories/odm";
import { fixtureEpisodes, fixtureEpisodeFileInfos, SERIE_SIMPSONS } from "../models";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;
const EPISODE_FILE_INFO_SIMPSONS = fixtureEpisodeFileInfos.Simpsons.List;

export const loadFixtureSerieAndEpisodesSimpsons = async () => {
  // Series
  const seriesDocOdm: SeriesOdm.FullDoc[] = [SERIE_SIMPSONS].map(SeriesOdm.toFullDoc);

  await SeriesOdm.Model.insertMany(seriesDocOdm);

  // Episodes
  const episodesDocOdm: EpisodeOdm.FullDoc[] = EPISODES_SIMPSONS.map(EpisodeOdm.toFullDoc);

  await EpisodeOdm.Model.insertMany(episodesDocOdm);

  // Episode File Infos
  const episodeFileInfosDocOdm: EpisodeFileInfoOdm.Doc[] = EPISODE_FILE_INFO_SIMPSONS
    .map(EpisodeFileInfoOdm.toFullDoc);

  await EpisodeFileInfoOdm.Model.insertMany(episodeFileInfosDocOdm);
};
