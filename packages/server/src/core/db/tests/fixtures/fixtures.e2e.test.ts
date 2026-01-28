import { expectSerie } from "$sharedSrc/models/series/tests";
import { fixtureEpisodes } from "$sharedSrc/models/episodes/tests/fixtures";
import { SERIE_SIMPSONS } from "$sharedSrc/models/series/tests/fixtures";
import { expectEpisodes } from "$sharedSrc/models/episodes/tests";
import { loadFixtureSimpsons } from "./sets";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { SeriesOdm } from "#episodes/series/crud/repository/odm";
import { createTestingAppModuleAndInit } from "#core/app/tests/app";

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

  expectEpisodes(episodes, EPISODES_SIMPSONS.map(e=>{
    const { fileInfos, ...ret } = e;

    return ret;
  } ));
} );
