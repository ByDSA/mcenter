import { expectSerie } from "$sharedSrc/models/series/test";
import { episodeDocOdmToModel } from "#episodes/repositories";
import { expectEpisodes } from "#episodes/models/test";
import { EpisodeModelOdm } from "#episodes/repositories";
import { SerieDocOdm, SerieModelOdm, serieDocOdmToEntity } from "#modules/series/repositories/odm";
import { createTestingAppModuleAndInit } from "#tests/nestjs/app";
import { loadFixtureSimpsons } from "./sets";
import { EPISODES_SIMPSONS, SERIE_SIMPSONS } from "./models";

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

  const seriesDocOdm: SerieDocOdm[] = await SerieModelOdm.find();
  const serie = serieDocOdmToEntity(seriesDocOdm[0]);

  expectSerie(serie, SERIE_SIMPSONS);

  const episodesDocOdm = await EpisodeModelOdm.find();
  const episodes = episodesDocOdm.map(episodeDocOdmToModel);

  expectEpisodes(episodes, EPISODES_SIMPSONS);
} );
