import TestDatabase from "../TestDatabase";
import TestMongoDatabase from "../TestMongoDatabase";
import { EPISODES_SIMPSONS, SERIE_SIMPSONS } from "./models";
import { loadFixtureSimpsons } from "./sets";
import { episodeDocOdmToModel } from "#modules/episodes";
import { expectEpisodes } from "#modules/episodes/models/test";
import { ModelOdm } from "#modules/episodes/repositories";
import { SerieDocOdm, SerieModelOdm, serieDocOdmToModel } from "#modules/series";
import { expectSerie } from "#sharedSrc/models/series/test";

let db: TestDatabase;

beforeAll(async () => {
  db = new TestMongoDatabase();

  db.init();
  await db.connect();
  await db.drop();
} );
it("should load fixture simpsons", async () => {
  await loadFixtureSimpsons();

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
