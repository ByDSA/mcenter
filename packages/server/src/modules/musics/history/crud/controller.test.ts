import { HttpStatus } from "@nestjs/common";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { HISTORY_MUSIC_SAMPLES1 } from "#musics/history/tests";
import { expectBodyEquals } from "#tests/suites/generate-http-case";
import { putUser } from "#tests/suites/auth";
import { mockMongoId } from "#tests/mongo";
import { MusicHistoryCrudController } from "./controller";
import { MusicHistoryRepository } from "./repository";
import { musicHistoryRepoMockProvider } from "./repository/tests";
import { GetManyCriteria } from "./repository/repository";

const validCriteria = {
  limit: 10,
  sort: {
    timestamp: "asc",
  },
  offset: 10,
  expand: ["musics"],
  filter: {
    resourceId: "id",
    timestampMax: 999,
  },
} as GetManyCriteria;

crudTestsSuite( {
  name: MusicHistoryCrudController.name,
  appModule: [
    {
      controllers: [MusicHistoryCrudController],
      providers: [
        musicHistoryRepoMockProvider,
      ],
    },
    {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    },
  ],
  repositoryClass: MusicHistoryRepository,
  testsConfig: {
    getManyCriteria: {
      repoConfig: (ctx)=>( {
        getFn: ()=>ctx.beforeExecution().repo.getManyByCriteria,
        expected: {
          params: [{
            ...validCriteria,
            filter: {
              ...validCriteria.filter,
              userId: ctx.authUser?.id, // Se añade en el controller
            },
          }],
        },
        returned: HISTORY_MUSIC_SAMPLES1,
      } ),
      auth: {
        roles: {
          admin: true,
          user: true,
          guest: false,
        },
      },
      data: {
        validInput: validCriteria,
      },
      customCases: [(props)=>( {
        name: "no criteria (user)",
        request: {
          url: "/" + GET_MANY_CRITERIA_PATH,
          method: "post",
        },
        before: async (p) => {
          await putUser( {
            getTestingSetup: props.getTestingSetup,
            request: p.request,
            user: fixtureUsers.Normal.UserWithRoles,
          } );
        },
        repoConfig: ((ctx: any)=>( {
          getFn: props.buildDynamicConfig(ctx).mockConfig.getFn,
          params: [{}],
          returned: HISTORY_MUSIC_SAMPLES1,
        } )),
        getExpressApp: props.getExpressApp,
        response: {
          body: expectBodyEquals(
            createSuccessResultResponse(
              HISTORY_MUSIC_SAMPLES1.map(h=>JSON.parse(JSON.stringify(h))),
            ),
          ),
          statusCode: HttpStatus.OK,
        },
      } ),
      ],
    },
    deleteOne: {
      auth: {
        roles: {
          admin: true,
          user: false,
          guest: false,
        },
      },
      repoConfig: (ctx)=>( {
        getFn: ()=>ctx.beforeExecution().repo.deleteOneByIdAndGet,
        expected: {
          params: [mockMongoId],
        },
        returned: HISTORY_MUSIC_SAMPLES1[0],
      } ),
      url: "/" + mockMongoId,
    },
  },
} );
