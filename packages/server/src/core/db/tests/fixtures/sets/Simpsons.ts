import { SERIE_SIMPSONS } from "$sharedSrc/models/series/tests/fixtures";
import { SeriesOdm } from "#modules/series/crud/repository/odm";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { EpisodeOdm } from "#episodes/crud/repository/odm";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodeHistoryEntryOdm } from "#episodes/history/crud/repository/odm";
import { StreamOdm } from "#modules/streams/crud/repository/odm";
import { STREAM_SIMPSONS } from "#modules/streams/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { fixtureEpisodeHistoryEntries } from "#episodes/history/tests";

export const loadFixtureSimpsons = async () => {
  await loadFixtureSerieAndEpisodesSimpsons();
  await loadFixtureStreamAndHistoryListSimpsons();
};

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;
const EPISODE_FILE_INFO_SIMPSONS = fixtureEpisodeFileInfos.Simpsons.List;
const loadFixtureSerieAndEpisodesSimpsons = async () => {
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
const loadFixtureStreamAndHistoryListSimpsons = async () => {
  // Streams
  const streamsDocOdm: StreamOdm.FullDoc[] = [STREAM_SIMPSONS].map(StreamOdm.toFullDoc);

  await StreamOdm.Model.insertMany(streamsDocOdm);

  // Episode History Entries
  const entriesOdm: EpisodeHistoryEntryOdm.FullDoc[] = fixtureEpisodeHistoryEntries.Simpsons.List
    .map(EpisodeHistoryEntryOdm.toFullDoc);

  await EpisodeHistoryEntryOdm.Model.insertMany(entriesOdm);
};
