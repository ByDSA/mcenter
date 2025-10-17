import { fixtureMusics } from "$sharedSrc/models/musics/tests/fixtures";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { createMockProvider } from "#utils/nestjs/tests";
import { MusicsRepository } from "./repositories/music";
import { MusicCrudController } from "./controller";
import { musicsRepoMockProvider } from "./repositories/music/tests";
import { MusicsUsersRepository } from "./repositories/user-info/repository";

crudTestsSuite( {
  name: MusicCrudController.name,
  appModule: [
    {
      imports: [DomainEventEmitterModule],
      controllers: [MusicCrudController],
      providers: [
        musicsRepoMockProvider,
        createMockProvider(MusicsUsersRepository),
      ],
    }, {
      auth: {
        repositories: "mock",
      },
    }],
  repositoryClass: MusicsRepository,
  testsConfig: {
    getOne: {
      repoConfig: ((ctx)=>( {
        getFn: ()=>ctx.beforeExecution().repo.getOneById,
        returned: fixtureMusics.Disk.List[0],
      } )),
    },
    patchOne: {
      auth: {
        roles: {
          admin: true,
          user: true, // TODO: cuando se agregue rol uploader, poner a false y añadir uploader
          guest: false,
        },
      },
      repoConfig: ((ctx)=>( {
        getFn: ()=>ctx.beforeExecution().repo.patchOneByIdAndGet,
        expected: {
          params: ["id", {
            entity: {
              title: "new title",
            },
          }],
        },
        returned: {
          ...fixtureMusics.Disk.List[0],
          title: "new title",
        },
      } )),
    },
  },
} );
