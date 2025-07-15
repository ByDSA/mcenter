import { HISTORY_ENTRIES_SIMPSONS, STREAM_SIMPSONS } from "../models";
import { EpisodeHistoryEntriesModelOdm, EpisodeHistoryEntriesDocOdm, entryToDocOdm } from "#episodes/history/repositories/odm";
import { StreamDocOdm, StreamModelOdm, streamToDocOdm } from "#modules/streams/repositories";

export const loadFixtureStreamAndHistoryListSimpsons = async () => {
  // Streams
  const streamsDocOdm: StreamDocOdm[] = [STREAM_SIMPSONS].map(streamToDocOdm);

  await StreamModelOdm.insertMany(streamsDocOdm);

  // Episode History Entries
  const entriesOdm: EpisodeHistoryEntriesDocOdm[] = HISTORY_ENTRIES_SIMPSONS
    .map(entryToDocOdm);

  await EpisodeHistoryEntriesModelOdm.insertMany(entriesOdm);
};
