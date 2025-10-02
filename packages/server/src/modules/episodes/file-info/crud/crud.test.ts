import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
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
        using: "mock",
      },
    }],
  repositoryClass: EpisodeFileInfoRepository,
  testsConfig: {
    patchOne: {
      auth: {
        admin: true,
        user: false,
      },
      repo: {
        getFn: (repo)=>repo.patchOneByIdAndGet,
        params: ["id", {
          entity: {
            path: "new path",
          },
        }],
        returned: fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01,
      },
      url: "/id",
    },
  },
} );
