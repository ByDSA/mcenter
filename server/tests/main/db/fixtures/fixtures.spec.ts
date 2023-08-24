import { episodeDocOdmToModel } from "#modules/episodes";
import { expectEpisodes } from "#modules/episodes/models/test";
import { ModelOdm } from "#modules/episodes/repositories";
import { SerieDocOdm, SerieModelOdm, serieDocOdmToModel } from "#modules/series";
import { expectSerie } from "#modules/series/models/test";
import TestMongoDatabase from "../test-mongo.database";
import { EPISODES_SIMPSONS, SERIE_SIMPSONS } from "./models";
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

  const seriesDocOdm: SerieDocOdm[] = await SerieModelOdm.find();
  const serie = serieDocOdmToModel(seriesDocOdm[0]);

  expectSerie(serie, SERIE_SIMPSONS);

  const episodesDocOdm = await ModelOdm.find();
  const episodes = episodesDocOdm.map(episodeDocOdmToModel);

  expectEpisodes(episodes, EPISODES_SIMPSONS);
} );

afterAll(async () => {
  await db.disconnect();
} );