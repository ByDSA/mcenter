import { PATH_ROUTES } from "$shared/routing";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { testRoute } from "#core/routing/test";
import { episodeFileInfoRepositoryMockProvider } from "./repository/tests";
import { EpisodeFileInfoRepository } from "./repository";
import { EpisodeFileInfosCrudController } from "./controller";

testRoute(PATH_ROUTES.episodes.fileInfo.path);

crudTestsSuite( {
  appModule: [
    {
      imports: [],
      controllers: [EpisodeFileInfosCrudController],
      providers: [
        episodeFileInfoRepositoryMockProvider,
      ],
    }],
  repositoryClass: EpisodeFileInfoRepository,
  testsConfig: {
    patchOne: {
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
