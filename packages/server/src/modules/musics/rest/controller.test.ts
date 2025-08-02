import { PATH_ROUTES } from "$shared/routing";
import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { MusicRepository } from "../rest/repository";
import { MusicRestController } from "./controller";
import { musicRepoMockProvider } from "./repository/tests";
import { testRoute } from "#core/routing/test/routing";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";

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
