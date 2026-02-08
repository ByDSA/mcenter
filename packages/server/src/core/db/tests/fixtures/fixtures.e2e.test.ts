import { fixtureEpisodes } from "$sharedSrc/models/episodes/tests/fixtures";
import { expectEpisodes } from "$sharedSrc/models/episodes/tests";
import { SERIES_SAMPLE_SERIES, SERIES_SIMPSONS } from "$sharedSrc/models/episodes/series/tests/fixtures";
import { expectSeries } from "$sharedSrc/models/episodes/series/tests";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { loadFixtureSampleSeries } from "./sets/SampleSeries";
import { loadFixtureSimpsons } from "./sets";

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
  const series = SeriesOdm.toEntity(seriesDocOdm[0]);

  expectSeries(series, SERIES_SIMPSONS);

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

  expectSeries(series, SERIES_SAMPLE_SERIES);

  const episodesDocOdm = await EpisodeOdm.Model.find();
  const episodes = episodesDocOdm.map(EpisodeOdm.toEntity);

  expectEpisodes(episodes, fixtureEpisodes.SampleSeries.List.map(e=>{
    const { fileInfos, ...ret } = e;

    return ret;
  } ));
} );
