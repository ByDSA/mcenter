import { PATH_ROUTES } from "$shared/routing";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { testRoute } from "#tests/main/routing";
import { episodeFileInfoRepositoryMockProvider } from "../repositories/tests";
import { EpisodeFileInfoRepository } from "../repositories";
import { EpisodeFileInfosRestController } from "./rest.controller";

testRoute(PATH_ROUTES.episodes.fileInfo.path);

restTestsSuite( {
  appModule: [
    {
      imports: [],
      controllers: [EpisodeFileInfosRestController],
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
