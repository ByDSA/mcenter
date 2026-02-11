import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { mockMongoId } from "#tests/mongo";
import { expectControllerCalled, expectControllerNotCalled } from "#core/auth/strategies/token/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { episodeEntitySchema } from "#episodes/models";
import { EpisodesCrudDtos } from "#episodes/models/dto";
import { EpisodesRepository } from "./repository";
import { EpisodesCrudController } from "./controller";

const SAMPLE = fixtureEpisodes.SampleSeries.Samples.EP1x01;

describe("episodesCrudController", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const validId = mockMongoId;
  const invalidId = "invalidId";
  const baseUrl = "/";

  async function initMocks(setup: TestingSetup) {
    const ret = {
      episodesRepo: setup.getMock(EpisodesRepository),
    };

    ret.episodesRepo.getOneById.mockResolvedValue(SAMPLE);
    ret.episodesRepo.createOneAndGet.mockResolvedValue(SAMPLE);
    ret.episodesRepo.patchOneByIdAndGet.mockResolvedValue(SAMPLE);
    ret.episodesRepo.deleteOneByIdAndGet.mockResolvedValue(SAMPLE);

    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [],
        controllers: [EpisodesCrudController],
        providers: [
          getOrCreateMockProvider(EpisodesRepository),
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

    mocks = await initMocks(testingSetup);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("getOneById (GET)", () => {
    const validUrl = `${baseUrl}${validId}`;
    const invalidUrl = `${baseUrl}${invalidId}`;

    it("valid request-response", async () => {
      const res = await request(router).get(validUrl);

      expectControllerCalled(testingSetup);

      const data = episodeEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("invalid id", async () => {
      const res = await request(router).get(invalidUrl);

      expectControllerNotCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository", async () => {
      await request(router).get(validUrl);

      expect(mocks.episodesRepo.getOneById).toHaveBeenCalled();
    } );
  } );

  describe("createOne (POST)", () => {
    const url = baseUrl;
    const validPayload = {
      episodeKey: SAMPLE.episodeKey,
      title: SAMPLE.title,
      seriesId: SAMPLE.seriesId,
    } satisfies EpisodesCrudDtos.CreateOne.Body;

    it("valid request-response", async () => {
      const res = await request(router).post(url)
        .send(validPayload);

      expectControllerCalled(testingSetup);

      const data = episodeEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("invalid payload", async () => {
      const res = await request(router).post(url)
        .send( {
          invalid: "field",
        } );

      expectControllerNotCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should call repository", async () => {
      await request(router).post(url)
        .send(validPayload);

      expect(mocks.episodesRepo.createOneAndGet).toHaveBeenCalled();
    } );
  } );

  describe("patchOne (PATCH)", () => {
    const validUrl = `${baseUrl}${validId}`;
    const payload = {
      entity: {
        title: "updated",
      },
    } satisfies EpisodesCrudDtos.Patch.Body;

    it("valid request-response", async () => {
      const res = await request(router).patch(validUrl)
        .send(payload);

      expectControllerCalled(testingSetup);

      const data = episodeEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should call repository", async () => {
      await request(router).patch(validUrl)
        .send(payload);

      expect(mocks.episodesRepo.patchOneByIdAndGet).toHaveBeenCalled();
    } );
  } );

  describe("deleteOne (DELETE)", () => {
    const validUrl = `${baseUrl}${validId}`;

    beforeEach(async ()=> {
      await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    } );

    it("valid request-response", async () => {
      const res = await request(router).delete(validUrl);

      expectControllerCalled(testingSetup);

      const data = episodeEntitySchema.parse(res.body.data);

      expect(data).toEqual(SAMPLE);
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("normal user should not delete", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
      const res = await request(router).delete(validUrl);

      expectControllerNotCalled(testingSetup);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
    } );

    it("should call repository", async () => {
      await request(router).delete(validUrl);

      expect(mocks.episodesRepo.deleteOneByIdAndGet).toHaveBeenCalled();
    } );
  } );
} );
