import { SerieWithEpisodesDocumentODM, SerieWithEpisodesModelODM } from "#modules/seriesWithEpisodes/repositories";
import { serieWithEpisodesDBToSerieWithEpisodes } from "#modules/seriesWithEpisodes/repositories/adapters";
import { expectSerieWithEpisodes } from "#modules/seriesWithEpisodes/test";
import TestMongoDatabase from "../test-mongo.database";
import { seriesWithEpisodesInitFixtures } from "./models";
import { loadFixtureSet1 } from "./sets";

let db: TestMongoDatabase;

beforeAll(async () => {
  db = new TestMongoDatabase();

  db.init();
  await db.connect();
  await db.drop();
} );
it("should load fixture set1", async () => {
  await loadFixtureSet1();

  const seriesDB: SerieWithEpisodesDocumentODM[] = await SerieWithEpisodesModelODM.find();
  const serieWithEpisodes = serieWithEpisodesDBToSerieWithEpisodes(seriesDB[0]);

  expectSerieWithEpisodes(serieWithEpisodes, seriesWithEpisodesInitFixtures[0]);
} );

afterAll(async () => {
  await db.disconnect();
} );