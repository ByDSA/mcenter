import { HISTORY_LIST_SIMPSONS, STREAM_SIMPSONS } from "../models";
import { HistoryListDocOdm, HistoryListModelOdm, historyListToDocOdm } from "#modules/historyLists";
import { StreamDocOdm, StreamModelOdm, streamToDocOdm } from "#modules/streams/repositories";

export const loadFixtureStreamAndHistoryListSimpsons = async () => {
  // Streams
  const streamsDocOdm: StreamDocOdm[] = [STREAM_SIMPSONS].map(streamToDocOdm);

  await StreamModelOdm.insertMany(streamsDocOdm);

  // History List
  const historyList: HistoryListDocOdm[] = [HISTORY_LIST_SIMPSONS].map(historyListToDocOdm);

  await HistoryListModelOdm.insertMany(historyList);
};
