/* eslint-disable @typescript-eslint/no-unused-vars */
import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { MovieEntity, movieEntitySchema } from "$shared/models/movies/movie";
import { fixtureMovies } from "$shared/models/movies/tests/fixtures";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { testFailValidation, expectControllerFinishRequest } from "#core/auth/strategies/token/tests";
import { MovieCrudController } from "./controller";
import { MovieRepository } from "./repositories/movie";

const SAMPLE = fixtureMovies.Samples.Inception;
const mockUser = fixtureUsers.Normal.UserWithRoles;
const mockAdminUser = fixtureUsers.Admin.UserWithRoles;

describe("movieCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      repo: testingSetup.getMock(MovieRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [MovieCrudController],
        providers: [
          getOrCreateMockProvider(MovieRepository),
        ],
      },
      {
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    router = testingSetup.routerApp;
    mocks = await initMocks();
  } );

  // eslint-disable-next-line require-await
  beforeEach(async () => {
    jest.clearAllMocks();
  } );

  describe("getOneById (GET /:id)", () => {
    const VALID_URL = `/${mockMongoId}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(mockUser);
      mocks.repo.getOneById.mockResolvedValueOnce(SAMPLE);

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);

      const data = movieEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
    } );

    it("should return OK + null data when entity not found", async () => {
      await testingSetup.useMockedUser(mockUser);
      mocks.repo.getOneById.mockResolvedValueOnce(null);

      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeNull();
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: () => request(router).get(INVALID_URL),
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await testingSetup.useMockedUser(mockUser);
        await request(router)
          .get(VALID_URL);

        expect(mocks.repo.getOneById).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getManyByCriteria (POST /get-many)", () => {
    const URL = `/${GET_MANY_CRITERIA_PATH}`;

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(mockUser);
      mocks.repo.getManyByCriteria.mockResolvedValueOnce(
        [fixtureMovies.Samples.Inception, fixtureMovies.Samples.TheMatrix],
      );

      const res = await request(router)
        .post(URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(2);
    } );

    it("should return empty array when no movies found", async () => {
      await testingSetup.useMockedUser(mockUser);
      mocks.repo.getManyByCriteria.mockResolvedValueOnce([]);

      const res = await request(router)
        .post(URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toEqual([]);
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await request(router)
          .post(URL)
          .send( {} );

        expect(mocks.repo.getManyByCriteria).toHaveBeenCalled();
      } );
    } );
  } );

  describe("getAll (GET /)", () => {
    const URL = "/";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(mockUser);
      mocks.repo.getAll.mockResolvedValueOnce(
        [fixtureMovies.Samples.Inception, fixtureMovies.Samples.TheMatrix],
      );

      const res = await request(router)
        .get(URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(2);
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await request(router)
          .get(URL);

        expect(mocks.repo.getAll).toHaveBeenCalled();
      } );
    } );
  } );

  describe("createOne (POST /)", () => {
    const URL = "/";
    const validPayload = {
      title: "New Movie",
      slug: "new-movie",
      year: 2024,
      genre: ["Drama"],
      director: "New Director",
      synopsis: "A new movie synopsis",
      duration: 120,
    };

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(mockUser);
      mocks.repo.createOneAndGet.mockResolvedValueOnce( {
        ...SAMPLE,
        ...validPayload,
        id: mockMongoId,
        uploaderUserId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        addedAt: new Date(),
      } as MovieEntity);

      const res = await request(router)
        .post(URL)
        .send(validPayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should call repository with uploaderUserId from auth user", async () => {
      await testingSetup.useMockedUser(mockUser);
      mocks.repo.createOneAndGet.mockResolvedValueOnce( {
        ...SAMPLE,
        ...validPayload,
        id: mockMongoId,
        uploaderUserId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        addedAt: new Date(),
      } as MovieEntity);

      await request(router)
        .post(URL)
        .send(validPayload);

      expect(mocks.repo.createOneAndGet).toHaveBeenCalledWith(
        expect.objectContaining( {
          uploaderUserId: mockUser.id,
        } ),
      );
    } );

    describe("invalid payload", () => {
      testFailValidation("title missing", {
        request: () => request(router)
          .post(URL)
          .send( {
            slug: "test",
            genre: ["Action"],
          } ),
      } );

      testFailValidation("slug missing", {
        request: () => request(router)
          .post(URL)
          .send( {
            title: "Test",
            genre: ["Action"],
          } ),
      } );

      testFailValidation("genre not array", {
        request: () => request(router)
          .post(URL)
          .send( {
            title: "Test",
            slug: "test",
            genre: "Action",
          } ),
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await testingSetup.useMockedUser(mockUser);
        await request(router)
          .post(URL)
          .send(validPayload);

        expect(mocks.repo.createOneAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("patchOne (PATCH /:id)", () => {
    const validUrl = `/${mockMongoId}`;
    const invalidUrl = "/notObjectId";
    const updatePayload = {
      entity: {
        title: "Updated Title",
      },
    };

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(mockAdminUser);
      mocks.repo.patchOneByIdAndGet.mockResolvedValueOnce( {
        ...SAMPLE,
        title: "Updated Title",
      } );

      const res = await request(router)
        .patch(validUrl)
        .send(updatePayload);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: () => request(router).patch(invalidUrl)
          .send(updatePayload),
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await testingSetup.useMockedUser(mockAdminUser);
        await request(router)
          .patch(validUrl)
          .send(updatePayload);

        expect(mocks.repo.patchOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );

  describe("deleteOne (DELETE /:id)", () => {
    const validUrl = `/${mockMongoId}`;
    const invalidUrl = "/notObjectId";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(mockAdminUser);
      mocks.repo.deleteOneByIdAndGet.mockResolvedValueOnce(SAMPLE);

      const res = await request(router)
        .delete(validUrl);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: () => request(router).delete("/notObjectId"),
      } );
    } );

    describe("repositories", () => {
      it("should call repository", async () => {
        await testingSetup.useMockedUser(mockAdminUser);
        await request(router)
          .delete(validUrl);

        expect(mocks.repo.deleteOneByIdAndGet).toHaveBeenCalled();
      } );
    } );
  } );
} );
