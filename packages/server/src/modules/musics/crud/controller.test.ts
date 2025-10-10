import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicsRepository } from "./repository";
import { MusicCrudController } from "./controller";
import { musicsRepoMockProvider } from "./repository/tests";

crudTestsSuite( {
  name: MusicCrudController.name,
  appModule: [
    {
      imports: [DomainEventEmitterModule],
      controllers: [MusicCrudController],
      providers: [
        musicsRepoMockProvider,
      ],
    }, {
      auth: {
        repositories: "mock",
      },
    }],
  repositoryClass: MusicsRepository,
  testsConfig: {
    getOne: {
      repo: {
        getFn: (repo)=>repo.getOneById,
        returned: fixtureMusics.Disk.List[0],
      },
    },
    patchOne: {
      auth: {
        admin: true,
        user: false,
      },
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
