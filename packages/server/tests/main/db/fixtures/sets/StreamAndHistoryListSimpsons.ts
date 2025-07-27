import { EpisodeHistoryEntryOdm } from "#episodes/history/repositories/odm";
import { StreamOdm } from "#modules/streams/repositories/odm";
import { HISTORY_ENTRIES_SIMPSONS, STREAM_SIMPSONS } from "../models";

export const loadFixtureStreamAndHistoryListSimpsons = async () => {
  // Streams
  const streamsDocOdm: StreamOdm.FullDoc[] = [STREAM_SIMPSONS].map(StreamOdm.toFullDoc);

  await StreamOdm.Model.insertMany(streamsDocOdm);

  // Episode History Entries
  const entriesOdm: EpisodeHistoryEntryOdm.FullDoc[] = HISTORY_ENTRIES_SIMPSONS
    .map(EpisodeHistoryEntryOdm.toFullDoc);

  await EpisodeHistoryEntryOdm.Model.insertMany(entriesOdm);
};
