import { PATH_ROUTES } from "$shared/routing";
import { serieRepositoryMockProvider } from "#modules/series/crud/repository/tests";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodes } from "#episodes/tests";
import { testRoute } from "#core/routing/test";
import { EpisodesRepository } from "./repository";
import { episodeRepositoryMockProvider } from "./repository/tests";
import { EpisodesCrudController } from "./controller";

testRoute(PATH_ROUTES.episodes.withParams("seriesKey", "episodeKey"));

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

crudTestsSuite( {
  appModule: [
    {
      imports: [],
      controllers: [EpisodesCrudController],
      providers: [
        episodeRepositoryMockProvider,
        serieRepositoryMockProvider,
      ],
    }],
  repositoryClass: EpisodesRepository,
  testsConfig: {
    getAll: {
      repo: {
        getFn: (repo)=>repo.getAllBySeriesKey,
        params: ["seriesKey"],
        returned: EPISODES_SIMPSONS,
      },
      url: "/seriesKey",
    },
    getOne: {
      repo: {
        getFn: (repo)=>repo.getOneByCompKey,
        params: [{
          seriesKey: "seriesKey",
          episodeKey: "episodeKey",
        }],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/seriesKey/episodeKey",
    },
    patchOne: {
      repo: {
        getFn: (repo)=>repo.patchOneByCompKeyAndGet,
        params: [{
          seriesKey: "seriesKey",
          episodeKey: "episodeKey",
        }, {
          entity: {
            title: "new title",
          },
        }],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/seriesKey/episodeKey",
    },
  },
} );
