import { HistoryListDocOdm, HistoryListModelOdm, historyListEntityToDocOdm } from "#episodes/history/repositories/odm";
import { StreamDocOdm, StreamModelOdm, streamToDocOdm } from "#modules/streams/repositories";
import { HISTORY_LIST_SIMPSONS, STREAM_SIMPSONS } from "../models";

export const loadFixtureStreamAndHistoryListSimpsons = async () => {
  // Streams
  const streamsDocOdm: StreamDocOdm[] = [STREAM_SIMPSONS].map(streamToDocOdm);

  await StreamModelOdm.insertMany(streamsDocOdm);

  // History List
  const historyList: HistoryListDocOdm[] = [HISTORY_LIST_SIMPSONS].map(historyListEntityToDocOdm);

  await HistoryListModelOdm.insertMany(historyList);
};
