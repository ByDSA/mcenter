import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodes } from "#episodes/tests";
import { createMockedModule } from "#utils/nestjs/tests";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeFileInfosCrudModule } from "#episodes/file-info/crud/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { StreamFileModule } from "#modules/resources/stream-file/module";
import { EpisodeResponseFormatterModule } from "#episodes/renderer/module";
import { EpisodeSlugHandlerService } from "./service";
import { EpisodesSlugController } from "./controller";
import { EpisodesRepository } from "#episodes/crud/episodes/repository";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

crudTestsSuite( {
  name: EpisodesSlugController.name,
  appModule: [
    {
      imports: [
        EpisodeResponseFormatterModule,
        createMockedModule(EpisodeHistoryCrudModule),
        createMockedModule(EpisodeFileInfosCrudModule),
        createMockedModule(EpisodesCrudModule),
        createMockedModule(StreamFileModule),
      ],
      controllers: [EpisodesSlugController],
      providers: [
        EpisodeSlugHandlerService,
      ],
    }, {
      auth: {
        repositories: "mock",
      },
    }],
  repositoryClass: EpisodesRepository,
  testsConfig: {
    getOne: {
      repoConfig: (ctx) =>( {
        getFn: ()=>ctx.beforeExecution().repo.getOneBySlug,
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
  },
} );
