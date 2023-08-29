import { HistoryList, HistoryListDocOdm, historyListToDocOdm } from "#modules/historyLists";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Database from "../../Database";
import { createCollectionIfNotExists } from "../utils";
import { StreamWithHistoryListDocOdm } from "./streamsWithHistoryList";
import { streamWithHistoryListToHistoryList, streamWithHistoryListToStream } from "./streamsWithHistoryList/models/adapters";

const OLD_COLLECTION = "streamsWithHistoryList";
const STREAMS_COLLECTION = "streams";
const HISTORY_LIST_COLLECTION = "historyLists";

(async function main() {
  dotenv.config();
  const database = new Database();

  database.init();
  await database.connect();

  const oldCollectionName = await getOldCollectionName();

  if (oldCollectionName === STREAMS_COLLECTION)
    await mongoose.connection.db.renameCollection(STREAMS_COLLECTION, OLD_COLLECTION);

  const streamsWithHistoryListCollection: StreamWithHistoryListDocOdm[] = await mongoose.connection.db.collection(OLD_COLLECTION).find()
    .toArray() as unknown as StreamWithHistoryListDocOdm[];

  await addToStreams(streamsWithHistoryListCollection);

  await addToHistoryList(streamsWithHistoryListCollection);

  await database.disconnect();
} )();

async function getOldCollectionName() {
  const streamsWithHistoryList = await mongoose.connection.db
    .collection(OLD_COLLECTION)
    .findOne();

  if (streamsWithHistoryList !== null && isOldCollection(streamsWithHistoryList))
    return OLD_COLLECTION;

  const series = await mongoose.connection.db
    .collection(STREAMS_COLLECTION)
    .findOne();

  if (series !== null && isOldCollection(series))
    return STREAMS_COLLECTION;

  throw new Error("No series found");
}

async function addToStreams(streamsWithHistoryListCollection: StreamWithHistoryListDocOdm[]) {
  console.log(`Adding streams to collection '${ STREAMS_COLLECTION }'...`);
  await createCollectionIfNotExists(STREAMS_COLLECTION);

  const streams = streamsWithHistoryListCollection.map(streamWithHistoryListToStream);

  for (const stream of streams) {
    // eslint-disable-next-line no-await-in-loop
    await mongoose.connection.db.collection(STREAMS_COLLECTION).updateOne( {
      id: stream.id,
    }, {
      $setOnInsert: stream,
    }, {
      upsert: true,
    } );
  }
}

async function addToHistoryList(streamsWithHistoryListOdm: StreamWithHistoryListDocOdm[]) {
  console.log(`Adding historyLists to collection '${ HISTORY_LIST_COLLECTION }'...`);
  await createCollectionIfNotExists(HISTORY_LIST_COLLECTION);

  const historyLists: HistoryList[] = streamsWithHistoryListOdm.map(streamWithHistoryListToHistoryList);

  for (const historyList of historyLists) {
    const historyListOdm: HistoryListDocOdm = historyListToDocOdm(historyList);

    // eslint-disable-next-line no-await-in-loop
    await mongoose.connection.db.collection(HISTORY_LIST_COLLECTION).updateOne( {
      id: historyListOdm.id,
    }, {
      $setOnInsert: historyListOdm,
    }, {
      upsert: true,
    } );
  }
}

function isOldCollection(doc: Object): boolean {
  const properties = ["id", "mode", "history"];

  return properties.every((property) => Object.hasOwn(doc,property));
}
