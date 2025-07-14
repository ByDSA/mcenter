import { HttpStatus } from "@nestjs/common";
import { createSuccessDataResponse } from "$shared/utils/http/responses/rest";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { episodeFileInfoRepositoryMockProvider } from "#modules/file-info/repositories/tests";
import { serieRepositoryMockProvider } from "#modules/series/repositories/tests";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import { restTestsSuite } from "#tests/suites/rest-suite";
import { EpisodeRepository } from "#episodes/repositories";
import { episodeRepositoryMockProvider } from "../repositories/tests";
import { EpisodesRestController } from "./rest.controller";

restTestsSuite( {
  appModule: [
    {
      controllers: [EpisodesRestController],
      providers: [
        DomainMessageBroker,
        episodeFileInfoRepositoryMockProvider,
        episodeRepositoryMockProvider,
        serieRepositoryMockProvider,
      ],
    }],
  repositoryClass: EpisodeRepository,
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
          innerId: "innerId",
        }],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/serieId/innerId",
    },
    patchOne: {
      repo: {
        getFn: (repo)=>repo.patchOneByIdAndGet,
        params: [{
          serieId: "serieId",
          innerId: "innerId",
        }, {
          entity: {
            title: "new title",
          },
        }],
        returned: EPISODES_SIMPSONS[0],
      },
      url: "/serieId/innerId",
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
