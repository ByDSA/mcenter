import { expectSerie } from "$sharedSrc/models/series/test";
import { EpisodeOdm } from "#episodes/repositories/odm";
import { expectEpisodes } from "#episodes/models/test";
import { SerieFullDocOdm, SerieModelOdm, serieDocOdmToEntity } from "#modules/series/repositories/odm";
import { createTestingAppModuleAndInit } from "#tests/nestjs/app";
import { loadFixtureSimpsons } from "./sets";
import { fixtureEpisodes, SERIE_SIMPSONS } from "./models";

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

  const seriesDocOdm: SerieFullDocOdm[] = await SerieModelOdm.find();
  const serie = serieDocOdmToEntity(seriesDocOdm[0]);

  expectSerie(serie, SERIE_SIMPSONS);

  const episodesDocOdm = await EpisodeOdm.Model.find();
  const episodes = episodesDocOdm.map(EpisodeOdm.docToEntity);

  expectEpisodes(episodes, EPISODES_SIMPSONS);
} );
