import { PATH_ROUTES } from "$shared/routing";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { testRoute } from "#tests/main/routing/routing";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { musicRepoMockProvider } from "../repositories/tests";
import { MusicRepository } from "../repositories";
import { fixtureMusics } from "../tests/fixtures";
import { MusicRestController } from "./rest.controller";

testRoute(PATH_ROUTES.musics.withParams("id"));

restTestsSuite( {
  name: MusicRestController.name,
  appModule: [
    {
      imports: [DomainEventEmitterModule],
      controllers: [MusicRestController],
      providers: [
        musicRepoMockProvider,
      ],
    }],
  repositoryClass: MusicRepository,
  testsConfig: {
    getOne: {
      repo: {
        getFn: (repo)=>repo.getOneById,
        returned: fixtureMusics.Disk.List[0],
      },
    },
    patchOne: {
      repo: {
        getFn: (repo)=>repo.patchOneByIdAndGet,
        params: ["id", {
          entity: {
            title: "new title",
          },
        }],
        returned: {
          ...fixtureMusics.Disk.List[0],
          title: "new title",
        },
      },
    },
  },
} );
