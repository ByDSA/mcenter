import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { mockMongoId } from "#tests/mongo";
import { episodeFileInfoRepositoryMockProvider } from "./repository/tests";
import { EpisodeFileInfoRepository } from "./repository";
import { EpisodeFileInfosCrudController } from "./controller";

crudTestsSuite( {
  name: EpisodeFileInfosCrudController.name,
  appModule: [
    {
      imports: [],
      controllers: [EpisodeFileInfosCrudController],
      providers: [
        episodeFileInfoRepositoryMockProvider,
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
        returned: fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01,
      } ),
      url: "/" + mockMongoId,
    },
  },
} );
