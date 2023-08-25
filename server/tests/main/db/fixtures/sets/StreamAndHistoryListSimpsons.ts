import { StreamWithHistoryListDocOdm, StreamWithHistoryListModelOdm } from "#modules/streamsWithHistoryList";
import { STREAM_WITH_HISTORY_LIST_SIMPSONS } from "../models";

export default async () => {
  // StreamWithHistoryList (old)
  const streamDocOdm: StreamWithHistoryListDocOdm = STREAM_WITH_HISTORY_LIST_SIMPSONS;

  await StreamWithHistoryListModelOdm.insertMany(streamDocOdm);
};