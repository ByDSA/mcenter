import { expectSerie } from "$sharedSrc/models/series/tests";
import { fixtureEpisodes } from "$sharedSrc/models/episodes/tests/fixtures";
import { SERIE_SIMPSONS } from "$sharedSrc/models/series/tests/fixtures";
import { expectEpisodes } from "$sharedSrc/models/episodes/tests";
import { EpisodeOdm } from "#episodes/rest/repository/odm";
import { SeriesOdm } from "#series/rest/repository/odm";
import { createTestingAppModuleAndInit } from "#core/app/tests/app";
import { loadFixtureSimpsons } from "./sets";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

beforeAll(async () => {
  await createTestingAppModuleAndInit( {
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
  await loadFixtureSimpsons();

  const seriesDocOdm: SeriesOdm.FullDoc[] = await SeriesOdm.Model.find();
  const serie = SeriesOdm.toEntity(seriesDocOdm[0]);

  expectSerie(serie, SERIE_SIMPSONS);

  const episodesDocOdm = await EpisodeOdm.Model.find();
  const episodes = episodesDocOdm.map(EpisodeOdm.toEntity);

  expectEpisodes(episodes, EPISODES_SIMPSONS);
} );
