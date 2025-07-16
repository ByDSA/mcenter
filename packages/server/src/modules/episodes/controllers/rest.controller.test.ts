import { HttpStatus } from "@nestjs/common";
import { createSuccessDataResponse } from "$shared/utils/http/responses";
import { episodeRepositoryMockProvider } from "../repositories/tests";
import { EpisodesRestController } from "./rest.controller";
import { serieRepositoryMockProvider } from "#modules/series/repositories/tests";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { EpisodesRepository } from "#episodes/repositories";

restTestsSuite( {
  appModule: [
    {
      imports: [],
      controllers: [EpisodesRestController],
      providers: [
        episodeRepositoryMockProvider,
        serieRepositoryMockProvider,
      ],
    }],
  repositoryClass: EpisodesRepository,
  testsConfig: {
    getAll: {
      repo: {
        getFn: (repo)=>repo.getAllBySerieId,
        params: ["serieId"],
        returned: EPISODES_SIMPSONS,
      },
      url: "/serieId",
    },
    getOne: {
      repo: {
        getFn: (repo)=>repo.getOneById,
        params: [{
          serieId: "serieId",
          code: "code",
        }],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/serieId/code",
    },
    patchOne: {
      repo: {
        getFn: (repo)=>repo.patchOneByIdAndGet,
        params: [{
          serieId: "serieId",
          code: "code",
        }, {
          entity: {
            title: "new title",
          },
        }],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/serieId/code",
    },
    getManyCriteria: {
      repo: {
        getFn: (repo)=>repo.getOneByPath,
        params: ["series/simpsons/1/1_80.mkv"],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/search",
      data: {
        validInput: {
          filter: {
            path: "series/simpsons/1/1_80.mkv",
          },
        },
      },
      expectedBody: createSuccessDataResponse(JSON.parse(JSON.stringify([EPISODES_SIMPSONS[0]]))),
      customCases: [(props) => ( {
        name: "empty array case",
        method: "post",
        url: props.url!,
        body: props.data?.validInput,
        expected: {
          body: createSuccessDataResponse([]),
          statusCode: HttpStatus.OK,
        },
        getExpressApp: props.getExpressApp,
        mock: {
          fn: [{
            getFn: ()=>props.repo.getFn(props.repo.getRepo()),
            params: props.repo.params,
            returned: null,
          }],
        },
      } )],
    },
  },
} );
