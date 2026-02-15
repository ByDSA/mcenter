import { fixtureEpisodes } from "#episodes/tests";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { EpisodeOdm } from "#episodes/crud/episodes/repository/odm";
import { EpisodeHistoryEntryOdm } from "#episodes/history/crud/repository/odm";
import { StreamOdm } from "#episodes/streams/crud/repository/odm";

export const loadFixtureSimpsons = async () => {
  await loadFixtureSerieAndEpisodesSimpsons();
  await loadFixtureStreamAndHistoryListSimpsons();
};

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.Episodes.List;
const EPISODE_FILE_INFO_SIMPSONS = fixtureEpisodes.Simpsons.FileInfos;
const loadFixtureSerieAndEpisodesSimpsons = async () => {
  // Series
  const seriesDocOdm: SeriesOdm.FullDoc[] = [
    fixtureEpisodes.Series.Samples.Simpsons,
  ].map(SeriesOdm.toFullDoc);

  await SeriesOdm.Model.insertMany(seriesDocOdm);

  // Episodes
  const episodesDocOdm: EpisodeOdm.FullDoc[] = EPISODES_SIMPSONS.map(EpisodeOdm.toFullDoc);

  await EpisodeOdm.Model.insertMany(episodesDocOdm);

  // Episode File Infos
  const episodeFileInfosDocOdm: EpisodeFileInfoOdm.Doc[] = EPISODE_FILE_INFO_SIMPSONS
    .map(EpisodeFileInfoOdm.toFullDoc);

  await EpisodeFileInfoOdm.Model.insertMany(episodeFileInfosDocOdm);
};
const loadFixtureStreamAndHistoryListSimpsons = async () => {
  // Streams
  const streamsDocOdm: StreamOdm.FullDoc[] = [
    fixtureEpisodes.Streams.Samples.Simpsons,
  ].map(StreamOdm.toFullDoc);

  await StreamOdm.Model.insertMany(streamsDocOdm);

  // Episode History Entries
  const entriesOdm: EpisodeHistoryEntryOdm.FullDoc[] = fixtureEpisodes.Simpsons.HistoryEntries.List
    .map(EpisodeHistoryEntryOdm.toFullDoc);

  await EpisodeHistoryEntryOdm.Model.insertMany(entriesOdm);
};
