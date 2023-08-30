import dotenv from "dotenv";
import mongoose from "mongoose";
import Database from "../../Database";
import { SerieWithEpisodes, SerieWithEpisodesDocODM, assertIsSerieWithEpisodesDocOdm, serieWithEpisodesToSerie } from "./seriesWithEpisodes";
import { episodeInSerieDocOdmToModel, episodeInSerieToEpisode, serieWithEpisodesDocOdmToModel } from "./seriesWithEpisodes/repositories/adapters";

const SERIES_WITH_EPISODES_COLLECTION = "seriesWithEpisodes";
const SERIES_COLLECTION = "series";
const EPISODES_COLLECTION = "episodes";

(async function main() {
  dotenv.config();
  const database = new Database();

  database.init();
  await database.connect();

  const oldSeriesCollectionName = await locateOldSeriesCollection();

  if (oldSeriesCollectionName === SERIES_COLLECTION)
    await mongoose.connection.db.renameCollection(SERIES_COLLECTION, SERIES_WITH_EPISODES_COLLECTION);

  const seriesWithEpisodesCollectionDocOdm: SerieWithEpisodes[] = await mongoose.connection.db.collection(SERIES_WITH_EPISODES_COLLECTION).find()
    .toArray() as unknown as SerieWithEpisodes[];

  await addToSeries(seriesWithEpisodesCollectionDocOdm);

  await addToEpisodes(seriesWithEpisodesCollectionDocOdm);

  await database.disconnect();
} )();

async function locateOldSeriesCollection() {
  const seriesWithEpisodes = await mongoose.connection.db
    .collection(SERIES_WITH_EPISODES_COLLECTION)
    .findOne();

  if (seriesWithEpisodes !== null && isOldCollection(seriesWithEpisodes))
    return SERIES_WITH_EPISODES_COLLECTION;

  const series = await mongoose.connection.db
    .collection(SERIES_COLLECTION)
    .findOne();

  if (series !== null && isOldCollection(series))
    return SERIES_COLLECTION;

  throw new Error("No series found");
}

async function createCollectionIfNotExists(collectionName: string) {
  const collections = await mongoose.connection.db.listCollections().toArray();

  if (!collections.some((collection) => collection.name === collectionName))
    await mongoose.connection.db.createCollection(collectionName);
}

async function addToSeries(seriesWithEpisodesCollection: SerieWithEpisodesDocODM[]) {
  console.log("Adding series");
  await createCollectionIfNotExists(SERIES_COLLECTION);

  const seriesWithEpisodes: SerieWithEpisodes[] = seriesWithEpisodesCollection.map(serieWithEpisodesDocOdmToModel);
  const series = seriesWithEpisodes.map(serieWithEpisodesToSerie);

  for (const serie of series) {
    // eslint-disable-next-line no-await-in-loop
    await mongoose.connection.db.collection(SERIES_COLLECTION).updateOne( {
      id: serie.id,
    }, {
      $setOnInsert: serie,
    }, {
      upsert: true,
    } );
  }
}

async function addToEpisodes(seriesWithEpisodesCollection: SerieWithEpisodes[]) {
  console.log("Adding episodes");
  await createCollectionIfNotExists(EPISODES_COLLECTION);

  for (const serieWithEpisodesDocOdm of seriesWithEpisodesCollection) {
    assertIsSerieWithEpisodesDocOdm(serieWithEpisodesDocOdm);
    const episodes = serieWithEpisodesDocOdm.episodes.map(e=>episodeInSerieToEpisode(episodeInSerieDocOdmToModel(e), serieWithEpisodesDocOdm.id));

    for (const episode of episodes) {
      // eslint-disable-next-line no-await-in-loop
      await mongoose.connection.db.collection(EPISODES_COLLECTION).updateOne( {
        episodeId: episode.episodeId,
        serieId: episode.serieId,
      }, {
        $setOnInsert: episode,
      }, {
        upsert: true,
      } );
    }
  }
}

function isOldCollection(doc: Object): boolean {
  const properties = ["id", "name", "episodes"];

  return properties.every((property) => Object.hasOwn(doc,property));
}
