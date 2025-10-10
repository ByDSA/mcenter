import { PATH_ROUTES } from "$shared/routing";
import { seriesRepositoryMockProvider } from "#modules/series/crud/repository/tests";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodes } from "#episodes/tests";
import { testRoute } from "#core/routing/test";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { episodeHistoryRepositoryMockProvider } from "#episodes/history/crud/repository/tests";
import { episodeRepositoryMockProvider } from "../crud/repository/tests";
import { EpisodesRepository } from "../crud/repository";
import { EpisodesSlugController } from "./controller";
import { EpisodeSlugHandlerService } from "./service";

testRoute(PATH_ROUTES.episodes.slug.withParams("seriesKey", "episodeKey"));

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

crudTestsSuite( {
  name: EpisodesSlugController.name,
  appModule: [
    {
      imports: [ResourceResponseFormatterModule],
      controllers: [EpisodesSlugController],
      providers: [
        episodeRepositoryMockProvider,
        episodeHistoryRepositoryMockProvider,
        seriesRepositoryMockProvider,
        EpisodeSlugHandlerService,
        ResourceSlugService,
      ],
    }, {
      auth: {
        repositories: "mock",
      },
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
        }, {
          expand: ["series"],
        }],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/seriesKey/episodeKey",
    },
    patchOne: {
      auth: {
        admin: true,
        user: false,
      },
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
