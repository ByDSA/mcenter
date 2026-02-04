import { fixtureEpisodes } from "$sharedSrc/models/episodes/tests/fixtures";
import { expectEpisodes } from "$sharedSrc/models/episodes/tests";
import { SAMPLE_SERIE, SERIE_SIMPSONS } from "$sharedSrc/models/episodes/series/tests/fixtures";
import { expectSerie } from "$sharedSrc/models/episodes/series/tests";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { loadFixtureSimpsons } from "./sets";
import { loadFixtureSampleSerie } from "./sets/SampleSerie";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;
let testingSetup: TestingSetup;

beforeAll(async () => {
  testingSetup = await createTestingAppModuleAndInit( {
    controllers: [],
    providers: [
    ],
  }, {
    db: {
      using: "default",
    },
  } );
} );

it("should load fixture simpsons", async () => {
  await testingSetup.db?.dropAll();
  await loadFixtureSimpsons();

  const seriesDocOdm: SeriesOdm.FullDoc[] = await SeriesOdm.Model.find();
  const serie = SeriesOdm.toEntity(seriesDocOdm[0]);

  expectSerie(serie, SERIE_SIMPSONS);

  const episodesDocOdm = await EpisodeOdm.Model.find();
  const episodes = episodesDocOdm.map(EpisodeOdm.toEntity);

  expectEpisodes(episodes, EPISODES_SIMPSONS.map(e=>{
    const { fileInfos, ...ret } = e;

    return ret;
  } ));
} );

it("should load fixture sample serie", async () => {
  await testingSetup.db?.dropAll();
  await loadFixtureSampleSerie();

  const seriesDocOdm: SeriesOdm.FullDoc[] = await SeriesOdm.Model.find();
  const serie = SeriesOdm.toEntity(seriesDocOdm[0]);

  expectSerie(serie, SAMPLE_SERIE);

  const episodesDocOdm = await EpisodeOdm.Model.find();
  const episodes = episodesDocOdm.map(EpisodeOdm.toEntity);

  expectEpisodes(episodes, fixtureEpisodes.SerieSample.List.map(e=>{
    const { fileInfos, ...ret } = e;

    return ret;
  } ));
} );
