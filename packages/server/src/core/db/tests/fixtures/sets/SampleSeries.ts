import { SERIES_SAMPLE_SERIES } from "$sharedSrc/models/episodes/series/tests/fixtures";
import { Types } from "mongoose";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodeHistoryEntryOdm } from "#episodes/history/crud/repository/odm";
import { StreamOdm } from "#episodes/streams/crud/repository/odm";
import { STREAM_SAMPLE } from "#episodes/streams/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodeHistoryEntryEntity } from "#episodes/history/models";
import { EpisodesUsersOdm } from "#episodes/crud/repositories/user-infos/odm";
import { EpisodeUserInfoEntity } from "#episodes/models";

export const loadFixtureSampleSeries = async () => {
  await loadFixtureSerieAndEpisodesSampleSeries();
  await loadFixtureStreamAndHistoryListSampleSeries();
};

export async function loadFixtureSampleSeriesWithoutEpisodes() {
  const seriesDocOdm: SeriesOdm.FullDoc[] = [SERIES_SAMPLE_SERIES].map(SeriesOdm.toFullDoc);

  await SeriesOdm.Model.insertMany(seriesDocOdm);
}

const loadFixtureSerieAndEpisodesSampleSeries = async () => {
  // Series
  await loadFixtureSampleSeriesWithoutEpisodes();

  // Episodes
  const episodesDocOdm: EpisodeOdm.FullDoc[] = fixtureEpisodes
    .SampleSeries.List.map(EpisodeOdm.toFullDoc);

  await EpisodeOdm.Model.insertMany(episodesDocOdm);

  // Episode File Infos
  const episodeFileInfosDocOdm: EpisodeFileInfoOdm.FullDoc[] = fixtureEpisodeFileInfos
    .SampleSeries.List
    .map(EpisodeFileInfoOdm.toFullDoc);

  await EpisodeFileInfoOdm.Model.insertMany(episodeFileInfosDocOdm);

  // Episode User Infos
  const episodeUserInfosDocOdm: EpisodesUsersOdm.Doc[] = ([{
    id: new Types.ObjectId().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    episodeId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
    lastTimePlayed: null,
    userId: fixtureUsers.Normal.User.id,
    weight: 2,
  }] satisfies EpisodeUserInfoEntity[])
    .map(EpisodesUsersOdm.toDoc);

  await EpisodesUsersOdm.Model.insertMany(episodeUserInfosDocOdm);
};
const loadFixtureStreamAndHistoryListSampleSeries = async () => {
  // Streams
  const streamsDocOdm: StreamOdm.FullDoc[] = [STREAM_SAMPLE].map(StreamOdm.toFullDoc);

  await StreamOdm.Model.insertMany(streamsDocOdm);

  // Episode History Entries
  const historyEntrySamples = [{
    id: new Types.ObjectId().toString(),
    date: new Date(),
    resourceId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
    streamId: new Types.ObjectId().toString(), // TODO
    userId: fixtureUsers.Normal.User.id,
  }] satisfies EpisodeHistoryEntryEntity[];
  const entriesOdm: EpisodeHistoryEntryOdm.FullDoc[] = historyEntrySamples.map(
    EpisodeHistoryEntryOdm.toFullDoc,
  );

  await EpisodeHistoryEntryOdm.Model.insertMany(entriesOdm);
};
