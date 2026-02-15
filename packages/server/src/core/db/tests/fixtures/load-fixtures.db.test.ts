import { fixtureEpisodes } from "$sharedSrc/models/episodes/tests/fixtures";
import { expectEpisodes } from "$sharedSrc/models/episodes/tests";
import { loadFixtureSampleSeries } from "./sets/SampleSeries";
import { loadFixtureSimpsons } from "./sets";
import { EpisodeOdm } from "#episodes/crud/episodes/repository/odm";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.Episodes.List;
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
  const series = SeriesOdm.toEntity(seriesDocOdm[0]);

  expect(series).toMatchObject(fixtureEpisodes.Series.Samples.Simpsons);

  const episodesDocOdm = await EpisodeOdm.Model.find();
  const episodes = episodesDocOdm.map(EpisodeOdm.toEntity);

  expectEpisodes(episodes, EPISODES_SIMPSONS.map(e=>{
    const { fileInfos, ...ret } = e;

    return ret;
  } ));
} );

it("should load fixture sample series", async () => {
  await testingSetup.db?.dropAll();
  await loadFixtureSampleSeries();

  const seriesDocOdm: SeriesOdm.FullDoc[] = await SeriesOdm.Model.find();
  const series = SeriesOdm.toEntity(seriesDocOdm[0]);

  expect(series).toMatchObject(fixtureEpisodes.Series.Samples.SampleSeries);

  const episodesDocOdm = await EpisodeOdm.Model.find();
  const episodes = episodesDocOdm.map(EpisodeOdm.toEntity);

  expectEpisodes(episodes, fixtureEpisodes.SampleSeries.Episodes.List.map(e=>{
    const { fileInfos, ...ret } = e;

    return ret;
  } ));
} );
