import { SERIE_SIMPSONS } from "$sharedSrc/models/series/tests/fixtures";
import { SeriesOdm } from "#modules/series/repositories/odm";
import { EpisodeFileInfoOdm } from "#episodes/file-info/repositories/odm";
import { EpisodeOdm } from "#episodes/repositories/odm";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodeHistoryEntryOdm } from "#episodes/history/repositories/odm";
import { StreamOdm } from "#modules/streams/repositories/odm";
import { STREAM_SIMPSONS } from "#modules/streams/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { HISTORY_ENTRIES_SIMPSONS } from "#episodes/history/tests";

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
  const entriesOdm: EpisodeHistoryEntryOdm.FullDoc[] = HISTORY_ENTRIES_SIMPSONS
    .map(EpisodeHistoryEntryOdm.toFullDoc);

  await EpisodeHistoryEntryOdm.Model.insertMany(entriesOdm);
};
