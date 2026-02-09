import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodes } from "#episodes/tests";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { SeriesRepository } from "#episodes/series/crud/repository";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodesSlugController } from "./controller";
import { EpisodeSlugHandlerService } from "./service";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

crudTestsSuite( {
  name: EpisodesSlugController.name,
  appModule: [
    {
      imports: [ResourceResponseFormatterModule],
      controllers: [EpisodesSlugController],
      providers: [
        getOrCreateMockProvider(EpisodesRepository),
        getOrCreateMockProvider(EpisodeHistoryRepository),
        getOrCreateMockProvider(SeriesRepository),
        getOrCreateMockProvider(EpisodesUsersRepository),
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
        getFn: ()=>ctx.beforeExecution().repo.getOneByEpisodeKeyAndSerieId,
        expected: {
          params: [
            "seriesKey",
            "episodeKey",
            {
              expand: ["series"],
            }, {
              requestUserId: undefined,
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
