import { PATH_ROUTES } from "$shared/routing";
import { serieRepositoryMockProvider } from "#modules/series/repositories/tests";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { EpisodesRepository } from "#episodes/repositories";
import { fixtureEpisodes } from "#tests/main/db/fixtures";
import { testRoute } from "#tests/main/routing";
import { episodeRepositoryMockProvider } from "../repositories/tests";
import { EpisodesRestController } from "./rest.controller";

testRoute(PATH_ROUTES.episodes.withParams("seriesKey", "episodeKey"));

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

restTestsSuite( {
  appModule: [
    {
      imports: [],
      controllers: [EpisodesRestController],
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
