import { PATH_ROUTES } from "$shared/routing";
import { episodeRepositoryMockProvider } from "../crud/repositories/episodes/tests";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodesSlugController } from "./controller";
import { EpisodeSlugHandlerService } from "./service";
import { seriesRepositoryMockProvider } from "#episodes/series/crud/repository/tests";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodes } from "#episodes/tests";
import { testRoute } from "#core/routing/test";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { episodeHistoryRepositoryMockProvider } from "#episodes/history/crud/repository/tests";
import { episodeUserInfosRepositoryMockProvider } from "#episodes/crud/repositories/user-infos/tests";

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
        episodeUserInfosRepositoryMockProvider,
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
      repoConfig: (ctx) =>( {
        getFn: ()=>ctx.beforeExecution().repo.getAllBySeriesKey,
        expected: {
          params: ["seriesKey"],
        },
        returned: EPISODES_SIMPSONS,
      } ),
      url: "/seriesKey",
    },
    getOne: {
      repoConfig: (ctx) =>( {
        getFn: ()=>ctx.beforeExecution().repo.getOneByCompKey,
        expected: {
          params: [{
            seriesKey: "seriesKey",
            episodeKey: "episodeKey",
          }, {
            criteria: {
              expand: ["series"],
            },
          }],
        },
        returned: EPISODES_SIMPSONS[0],
      } ),
      url: "/seriesKey/episodeKey",
    },
    patchOne: {
      auth: {
        roles: {
          admin: true,
          user: false,
          guest: false,
        },
      },
      repoConfig: (ctx) =>( {
        getFn: ()=>ctx.beforeExecution().repo.patchOneByCompKeyAndGet,
        expected: {
          params: [{
            seriesKey: "seriesKey",
            episodeKey: "episodeKey",
          }, {
            entity: {
              title: "new title",
            },
          }],
        },
        returned: EPISODES_SIMPSONS[0],
      } ),
      url: "/seriesKey/episodeKey",
    },
  },
} );
