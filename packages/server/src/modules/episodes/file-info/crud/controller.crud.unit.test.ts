import { crudTestsSuite } from "#tests/suites/crud-suite";
import { mockMongoId } from "#tests/mongo";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { EpisodeFileInfosCrudController } from "./controller";
import { EpisodeFileInfoRepository } from "./repository";

crudTestsSuite( {
  name: EpisodeFileInfosCrudController.name,
  appModule: [
    {
      imports: [],
      controllers: [EpisodeFileInfosCrudController],
      providers: [
        getOrCreateMockProvider(EpisodeFileInfoRepository),
      ],
    }, {
      auth: {
        repositories: "mock",
      },
    }],
  repositoryClass: EpisodeFileInfoRepository,
  testsConfig: {
    patchOne: {
      auth: {
        roles: {
          admin: true,
          user: false,
          guest: false,
        },
      },
      repoConfig: (ctx) =>( {
        getFn: ()=>ctx.beforeExecution().repo.patchOneByIdAndGet,
        expected: {
          params: [mockMongoId, {
            entity: {
              path: "new path",
            },
          }],
        },
        returned: fixtureEpisodes.Episodes.FullSamples.SampleSeries.EP1x01.fileInfos[0],
      } ),
      url: "/" + mockMongoId,
    },
  },
} );
