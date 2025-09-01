import { Application } from "express";
import request from "supertest";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { HttpStatus } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { DEPENDENCY_SIMPSONS } from "$sharedSrc/models/episodes/dependencies/test";
import { EpisodeCompKey } from "$shared/models/episodes";
import { testRoute } from "#core/routing/test";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { EpisodeDependenciesRepository } from "./repository";
import { episodeDependenciesRepositoryMockProvider } from "./repository/tests";
import { EpisodeDependenciesCrudController } from "./controller";

testRoute(PATH_ROUTES.episodes.dependencies.withParams("serie", "episode"));

describe("crudController", () => {
  let routerApp: Application;
  let repository: jest.Mocked<EpisodeDependenciesRepository>;
  let testingSetup: TestingSetup;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [EpisodeDependenciesCrudController],
      providers: [
        episodeDependenciesRepositoryMockProvider,
      ],
    } );
    repository = testingSetup.module
      .get<jest.Mocked<EpisodeDependenciesRepository>>(EpisodeDependenciesRepository);

    routerApp = testingSetup.routerApp;
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("should be defined", () => {
    expect(repository).toBeDefined();
    expect(routerApp).toBeDefined();
  } );

  describe("getNextByLast", () => {
    it("should call repository", async () => {
      repository.getNextByLast.mockResolvedValueOnce(null);
      await request(routerApp)
        .get("/serie/episode")
        .send();

      expect(repository.getNextByLast).toHaveBeenCalledTimes(1);
      expect(repository.getNextByLast).toHaveBeenCalledWith( {
        seriesKey: "serie",
        episodeKey: "episode",
      } as EpisodeCompKey);
    } );

    it("should return 422 if is not found in repository", async () => {
      repository.getNextByLast.mockResolvedValueOnce(null);
      await request(routerApp)
        .get("/serie/episode")
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .send();
    } );
  } );

  describe("getManyEntriesByCriteria", () => {
    const URL = "/";

    it("should call repository", async () => {
      await request(routerApp)
        .post(URL)
        .send( {} );

      expect(repository.getManyByCriteria).toHaveBeenCalledTimes(1);
    } );

    it("should throw 422 if provided unexpected property", async () => {
      await request(routerApp)
        .post(URL)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .send( {
          cosarara: "porquesi",
        } );
    } );

    it("should return all if empty criteria provided", async () => {
      const dependencies = [DEPENDENCY_SIMPSONS];

      repository.getManyByCriteria.mockResolvedValueOnce(dependencies);

      const response = await request(routerApp)
        .post(URL)
        .send( {} );

      expect(response.statusCode).toEqual(HttpStatus.OK);
      expect(response.body).toEqual(
        createSuccessResultResponse(dependencies),
      );
    } );
  } );
} );
