import { Application } from "express";
import request from "supertest";
import { HttpStatus, UnprocessableEntityException } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { fixtureMusicFileInfos } from "$shared/models/musics/file-info/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerFailRequest, expectControllerFinishRequest, testFailValidation, testManyAuth } from "#core/auth/strategies/token/tests";
import { musicFileInfoEntitySchema } from "../models";
import { MusicFileInfoController } from "./controller";
import { MusicFileInfoRepository } from "./repository";

const SAMPLE = fixtureMusicFileInfos.Disk.Samples.DK;

describe("musicFileInfoController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;

  // eslint-disable-next-line require-await
  async function initMocks() {
    const ret = {
      fileInfosRepo: testingSetup.getMock(MusicFileInfoRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [],
        controllers: [MusicFileInfoController],
        providers: [
          getOrCreateMockProvider(MusicFileInfoRepository),
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

  beforeEach(async () => {
    jest.clearAllMocks();
    await testingSetup.useMockedUser(null);
  } );

  describe("getMany (POST)", () => {
    const URL = `/${GET_MANY_CRITERIA_PATH}`;

    it("valid request-response with musicId filter", async () => {
      const res = await request(router)
        .post(URL)
        .send( {
          filter: {
            musicId: fixtureMusicFileInfos.Disk.Samples.DK.musicId,
          },
        } satisfies MusicFileInfoCrudDtos.GetMany.Criteria);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(musicFileInfoEntitySchema.array().parse(res.body.data))
        .toEqual([fixtureMusicFileInfos.Disk.Samples.DK]);
    } );

    it("should return empty array when filter is not provided", async () => {
      const res = await request(router)
        .post(URL)
        .send( {} );

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.data).toEqual([]);
    } );

    testFailValidation("no musicId filter", {
      request: ()=>request(router)
        .post(URL)
        .send( {
          filter: {},
        } ),
    } );

    testFailValidation("invalid musicId format in filter", {
      request: () => request(router)
        .post(URL)
        .send( {
          filter: {
            musicId: "invalid-id",
          },
        } ),
    } );

    describe("repositories", () => {
      it("should call getAllByMusicId when musicId provided", async () => {
        await request(router)
          .post(URL)
          .send( {
            filter: {
              musicId: mockMongoId,
            },
          } );

        expect(mocks.fileInfosRepo.getAllByMusicId).toHaveBeenCalled();
      } );
    } );
  } );

  describe("deleteOne (DELETE)", () => {
    const VALID_URL = `/${SAMPLE.id}`;
    const INVALID_URL = "/notObjectId";

    it("valid request-response", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

      const res = await request(router)
        .delete(VALID_URL);

      expectControllerFinishRequest();

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(musicFileInfoEntitySchema.parse(res.body.data)).toEqual(SAMPLE);
    } );

    // TODO: debería hacerse en test de repository, este test aquí no tiene sentido
    it("should return 422 when entity not found", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

      mocks.fileInfosRepo.deleteOneById.mockRejectedValueOnce(new UnprocessableEntityException());

      const res = await request(router)
        .delete(VALID_URL);

      expectControllerFailRequest();

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    describe("path parameters validation", () => {
      testFailValidation("id param", {
        request: ()=>request(router)
          .delete(INVALID_URL),
        user: fixtureUsers.Admin.UserWithRoles,
      } );
    } );

    describe("authentication", () => {
      testManyAuth( {
        request: ()=>request(router)
          .delete(VALID_URL),
        list: [
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

    describe("repositories", () => {
      it("should call deleteOneById", async () => {
        await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);

        await request(router)
          .delete(VALID_URL);

        expect(mocks.fileInfosRepo.deleteOneById).toHaveBeenCalled();
      } );
    } );
  } );
} );
