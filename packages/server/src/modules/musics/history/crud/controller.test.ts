import { HttpStatus } from "@nestjs/common";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { crudTestsSuite } from "#tests/suites/crud-suite";
import { HISTORY_MUSIC_SAMPLES1 } from "#musics/history/tests";
import { MusicHistoryEntryDtos } from "../models/dto";
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
  skip: true, // TODO
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
      repo: {
        getFn: (repo)=>repo.getManyByCriteria,
        params: [{
          ...validCriteria,
          filter: {
            ...validCriteria.filter,
            userId: fixtureUsers.Normal.User.id, // Se añade en el controller
          },
        }],
        returned: HISTORY_MUSIC_SAMPLES1,
      },
      auth: {
        admin: true,
        user: true,
      },
      url: "/search",
      data: {
        validInput: validCriteria,
      },
      customCases: [(props)=>( {
        name: "no criteria",
        url: "/search",
        method: "post",
        repo: {
          getFn: ()=>props.repo.getFn,
          params: [{}],
          returned: HISTORY_MUSIC_SAMPLES1,
        },
        getExpressApp: props.getExpressApp,
        expected: {
          body: createSuccessResultResponse(
            HISTORY_MUSIC_SAMPLES1.map(MusicHistoryEntryDtos.Entity.toDto),
          ),
          statusCode: HttpStatus.OK,
        },
      } ),
      ],
    },
    deleteOne: {
      auth: {
        admin: true,
        user: false,
      },
      repo: {
        getFn: (repo)=>repo.deleteOneByIdAndGet,
        params: ["entryId"],
        returned: HISTORY_MUSIC_SAMPLES1[0],
      },
      url: "/entryId",
    },
  },
} );
