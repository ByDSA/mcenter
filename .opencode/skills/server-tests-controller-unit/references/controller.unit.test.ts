/* eslint-disable @typescript-eslint/no-unused-vars, no-undef */
import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { createMockedModule, getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { testFailValidation, testValidation, expectControllerFinishRequest, createTokenTests, testManyAuth } from "#core/auth/strategies/token/tests";

// Import your controller, repository, services, fixtures, etc.
// import { YourController } from "./controller";
// import { YourRepositoryOrService } from "./repository";
// import { FIXTURE_DATA } from "./tests/fixtures";
/**
 * CONTROLLER TEST PROTOTYPE
 *
 * This template provides a standardized structure for controller tests.
 * Replace placeholders with your actual implementations.
 *
 * IMPORTANT: Do NOT put block comments in this doc.
 * They're only for your understanding.
 * Except eslint-disable, keep them all.
 */

const SAMPLE = {}; // Try to guess

describe("yourControllerName", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // Add this eslint rule:
  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      yourRepo: testingSetup.getMock(YourRepositoryOrService),
      // service: setup.getMock(YourService),
      // Add other mocked dependencies here
    };

    // Optional: Set default authenticated user
    // await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [
        // Add required module imports
          createMockedModule(AnotherModule),
        ],
        controllers: [YourController],
        providers: [
          getOrCreateMockProvider(YourRepositoryOrService),
        // Add other providers
        ],
      },
      {
      // Optional: Only if any endpoint in controller uses @User decorator
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    router = testingSetup.routerApp;
    mocks = await initMocks();
  } );

  beforeEach(async () => {
    jest.clearAllMocks();
    // Optional (Only if any endpoint in controller uses @User decorator)
    await testingSetup.useMockedUser(null);
  } );

  // EXAMPLE OF CONTROLLER ENDPOINT METHOD HANDLER
  describe("[method controller] ([HTTP VERB])", () => {
    const VALID_URL = `/${mockMongoId}`;
    const INVALID_URL = "/notObjectId";

    // Don't mock repo methods here
    it("valid request-response", async () => {
      // Optional (request adhock user):
      // await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
      // Don't apply mock value/implementation for repositories/services in valid case
      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);

      const data = entitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
    } );

    it("should return OK + null data when entity not found", async () => {
      mocks.repo[method].mockResolvedValueOnce(null); // or {} or whatever

      // split request calls into lines
      const res = await request(router)
        .get(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toBeNull(); // or toEqual({}) or whatever
    } );

    // Test each single param
    describe("path parameters validation", () => {
      testFailValidation("id", {
        request: ()=>request(router).get(INVALID_URL),
      } );
    } );

    describe("query params", () => {
      testValidation("[param] parameter ([value])", {
        request: ()=>request(router)
          .get(VALID_URL)
          .query( {
            param: "value",
          } ),
        shouldPass: true,
      } );

      testFailValidation("[param] query parameter", {
        request: ()=>request(router)
          .get(VALID_URL)
          .query( {
            param: "invalidValue",
          } ),
      } );
    } );

    describe("authentication", ()=> {
      // Optional: only if @TokenAuth decorator affects to the endpoint
      createTokenTests( {
        url: URL,
        expectedUser: fixtureUsers.Normal.UserWithRoles,
      } );

      // Optional: only if @User decorator is used in the endpoint parameters
      testManyAuth( {
        // use valid request
        request: ()=>request(router)
          .get(VALID_URL),
        list: [
          // Put always the three users
          {
            user: null,
            shouldPass: false,
          }, {
            user: fixtureUsers.Normal.UserWithRoles,
            shouldPass: false,
          }, {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );

    describe("repositories", ()=> {
      it("should call repository", async () => {
        await request(router)
          .get(VALID_URL);

        // IMPORTANT: Only test repository/service methods have been called, NOT the toHaveBeenCalledWith
        expect(mocks.yourRepo.method).toHaveBeenCalled();
      } );
    } );
  } );

  // EXAMPLE: POST/CREATE
  describe("createOne (POST)", () => {
    const URL = "/";
    const validPayload = {
      // Define valid creation payload
      name: "Test Resource",
      description: "Test description",
      // guess dto namespace:
    } satisfies MusicPlaylistCrudDtos.CreateOne.Body;

    // Here "valid request-response" test (if it resturns data, should return HttpStatus.OK)

    // Here "params" group tests

    describe("invalid payload", () => {
      testFailValidation("[description]", {
        request: ()=>request(router)
          .post(URL)
          .send( {
            shouldBeAnObjectId: "123456",
          } ),
      } );
    } );

    // Here "repositories" group tests
  } );

  // EXAMPLE PATCH/UPDATE
  describe("patchOne", () => {
    const validUrl = `/${mockMongoId}`;
    const updatePayload = {
      entity: {
        name: "Updated Name",
      },
      // guess dto namespace:
    } satisfies MusicPlaylistCrudDtos.PatchOne.Body;

    // Here same type of tests as Create
    // Differences: should return HttpStatus.OK in a valid request-response
    // Don't do tests like "id not found". Inner method exceptions are repository level.
  } );

  // EXAMPLE GET ONE/MANY
  describe("getOne or getMany", () => {
    const validUrl = `/${GET_MANY_CRITERIA_PATH}`;
    // or:
    // const validUrl = `/${GET_ONE_CRITERIA_PATH}`;
    // criteria object has keys like filter, sort, limit (only getMany), offset (only getMany)
    // Here same type of tests as getOneById
  } );
} );
