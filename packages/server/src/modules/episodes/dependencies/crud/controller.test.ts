import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { DEPENDENCY_SIMPSONS } from "$sharedSrc/models/episodes/dependencies/test";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { EpisodeDependenciesRepository } from "./repository/repository";
import { EpisodeDependenciesCrudController } from "./controller";

describe("episodeDependenciesCrudController", () => {
  let routerApp: Application;
  let testingSetup: TestingSetup;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks(setup: TestingSetup) {
    const ret = {
      repo: setup.getMock(EpisodeDependenciesRepository),
    };

    ret.repo.getNextByEpisodeId.mockResolvedValue(DEPENDENCY_SIMPSONS);
    ret.repo.getManyByCriteria.mockResolvedValue([DEPENDENCY_SIMPSONS]);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [EpisodeDependenciesCrudController],
      providers: [
        getOrCreateMockProvider(EpisodeDependenciesRepository),
      ],
    } );

    routerApp = testingSetup.routerApp;
    mocks = await initMocks(testingSetup);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getNext", () => {
    const validUrl = `/${mockMongoId}`;
    const invalidUrl = "/notObjectId";

    it("should return 422 if episodeId is not ObjectId", async () => {
      const res = await request(routerApp)
        .get(invalidUrl);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository with correct params", async () => {
      await request(routerApp)
        .get(validUrl);

      expect(mocks.repo.getNextByEpisodeId).toHaveBeenCalledTimes(1);
      expect(mocks.repo.getNextByEpisodeId).toHaveBeenCalledWith(mockMongoId);
    } );

    it("should return 200 when dependency found", async () => {
      const res = await request(routerApp)
        .get(validUrl);

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return 422 when dependency not found", async () => {
      mocks.repo.getNextByEpisodeId.mockResolvedValueOnce(null);

      const res = await request(routerApp)
        .get(validUrl);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );
  } );

  describe("getManyEntriesByCriteria", () => {
    const URL = `/${GET_MANY_CRITERIA_PATH}`;

    it("should return 422 if provided unexpected property", async () => {
      const res = await request(routerApp)
        .post(URL)
        .send( {
          cosarara: "porquesi",
        } );

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository with empty criteria", async () => {
      await request(routerApp)
        .post(URL)
        .send( {} );

      expect(mocks.repo.getManyByCriteria).toHaveBeenCalledTimes(1);
      expect(mocks.repo.getManyByCriteria).toHaveBeenCalledWith( {} );
    } );

    it("should return 200 and data when criteria is valid", async () => {
      const dependencies = [DEPENDENCY_SIMPSONS];

      mocks.repo.getManyByCriteria.mockResolvedValueOnce(dependencies);

      const res = await request(routerApp)
        .post(URL)
        .send( {} );

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        createSuccessResultResponse(dependencies),
      );
    } );
  } );
} );
