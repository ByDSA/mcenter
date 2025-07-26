import { HttpStatus, RequestMethod } from "@nestjs/common";
import { createSuccessDataResponse } from "$shared/utils/http/responses";
import { PATH_ROUTES } from "$shared/routing";
import { MusicHistoryRepository } from "../repositories";
import { musicHistoryRepoMockProvider } from "../repositories/tests";
import { MusicHistoryEntryDtos } from "../models/dto";
import { GetManyCriteria } from "../repositories/repository";
import { MusicHistoryRestController } from "./rest.controller";
import { HISTORY_MUSIC_SAMPLES1 } from "#tests/main/db/fixtures/models/music";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { testRoute } from "#tests/main/routing";

describe("global routes", () => {
  testRoute(PATH_ROUTES.musics.history.path);
  testRoute(PATH_ROUTES.musics.history.withParams("id"), {
    httpMethod: RequestMethod.DELETE,
  } );
} );

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

restTestsSuite( {
  appModule: [
    {
      controllers: [MusicHistoryRestController],
      providers: [
        musicHistoryRepoMockProvider,
      ],
    },
  ],
  repositoryClass: MusicHistoryRepository,
  testsConfig: {
    getAll: {
      repo: {
        getFn: (repo)=>repo.getAll,
        returned: HISTORY_MUSIC_SAMPLES1,
      },
      url: "/",
    },
    getManyCriteria: {
      repo: {
        getFn: (repo)=>repo.getManyByCriteria,
        params: [validCriteria],
        returned: HISTORY_MUSIC_SAMPLES1,
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
          body: createSuccessDataResponse(
            HISTORY_MUSIC_SAMPLES1.map(MusicHistoryEntryDtos.Entity.toDto),
          ),
          statusCode: HttpStatus.OK,
        },
      } ),
      ],
    },
    deleteOne: {
      repo: {
        getFn: (repo)=>repo.deleteOneByIdAndGet,
        params: ["entryId"],
        returned: HISTORY_MUSIC_SAMPLES1[0],
      },
      url: "/entryId",
    },
  },
} );
