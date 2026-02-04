import { SAMPLE_SERIE } from "$sharedSrc/models/episodes/series/tests/fixtures";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodeHistoryEntryOdm } from "#episodes/history/crud/repository/odm";
import { StreamOdm } from "#episodes/streams/crud/repository/odm";
import { STREAM_SAMPLE } from "#episodes/streams/tests";
import { fixtureEpisodes } from "#episodes/tests";

export const loadFixtureSampleSerie = async () => {
  await loadFixtureSerieAndEpisodesSampleSerie();
  await loadFixtureStreamAndHistoryListSampleSerie();
};

const loadFixtureSerieAndEpisodesSampleSerie = async () => {
  // Series
  const seriesDocOdm: SeriesOdm.FullDoc[] = [SAMPLE_SERIE].map(SeriesOdm.toFullDoc);

  await SeriesOdm.Model.insertMany(seriesDocOdm);

  // Episodes
  const episodesDocOdm: EpisodeOdm.FullDoc[] = fixtureEpisodes
    .SerieSample.List.map(EpisodeOdm.toFullDoc);

  await EpisodeOdm.Model.insertMany(episodesDocOdm);

  // Episode File Infos
  const episodeFileInfosDocOdm: EpisodeFileInfoOdm.Doc[] = fixtureEpisodeFileInfos.SampleSerie.List
    .map(EpisodeFileInfoOdm.toFullDoc);

  await EpisodeFileInfoOdm.Model.insertMany(episodeFileInfosDocOdm);
};
const loadFixtureStreamAndHistoryListSampleSerie = async () => {
  // Streams
  const streamsDocOdm: StreamOdm.FullDoc[] = [STREAM_SAMPLE].map(StreamOdm.toFullDoc);

  await StreamOdm.Model.insertMany(streamsDocOdm);

  // Episode History Entries
  const entriesOdm: EpisodeHistoryEntryOdm.FullDoc[] = [].map(EpisodeHistoryEntryOdm.toFullDoc);

  await EpisodeHistoryEntryOdm.Model.insertMany(entriesOdm);
};
