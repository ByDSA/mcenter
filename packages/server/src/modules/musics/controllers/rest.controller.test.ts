import { PATH_ROUTES } from "$shared/routing";
import { musicRepoMockProvider, MUSICS_SAMPLES_IN_DISK } from "../repositories/tests";
import { MusicRepository } from "../repositories";
import { MusicRestController } from "./rest.controller";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { testRoute } from "#tests/main/routing/routing";

testRoute(PATH_ROUTES.musics.withParams("id"));

restTestsSuite( {
  name: MusicRestController.name,
  appModule: [
    {
      controllers: [MusicRestController],
      providers: [
        DomainMessageBroker,
        musicRepoMockProvider,
      ],
    }],
  repositoryClass: MusicRepository,
  testsConfig: {
    getOne: {
      repo: {
        getFn: (repo)=>repo.getOneById,
        returned: MUSICS_SAMPLES_IN_DISK[0],
      },
    },
    patchOne: {
      repo: {
        getFn: (repo)=>repo.patchOneById,
        params: ["id", {
          entity: {
            title: "new title",
          },
        }],
      },
    },
  },
} );
