import { Application } from "express";
import request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { SERIES_SAMPLE_SERIES } from "$sharedSrc/models/episodes/series/tests/fixtures";
import { UserPayload } from "$shared/models/auth";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodeEntityWithFileInfos } from "#episodes/models";
import { fixturesRemotePlayers } from "../tests/fixtures";
import { AuthPlayerService } from "../AuthPlayer.service";
import { PlayEpisodeService } from "./service";
import { PlayEpisodeController } from "./controller";

const EPISODE_WITH_FILE_INFO: EpisodeEntityWithFileInfos = {
  ...fixtureEpisodes.SampleSeries.Samples.EP1x01,
  fileInfos: [fixtureEpisodeFileInfos.SampleSeries.Samples.EP1x01],
};

describe("playEpisodeController", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  let remotePlayerId = fixturesRemotePlayers.valid.id;

  async function initMocks(setup: TestingSetup) {
    const ret = {
      playVideoService: setup.getMock(PlayEpisodeService),
      authPlayerService: setup.getMock(AuthPlayerService),
      episodesRepo: setup.getMock(EpisodesRepository),
    };

    ret.playVideoService.playEpisodeStream.mockResolvedValue([EPISODE_WITH_FILE_INFO]);

    ret.episodesRepo.getOneBySeriesKeyAndEpisodeKey
      .mockResolvedValue(fixtureEpisodes.SampleSeries.Samples.EP1x01);
    ret.episodesRepo.getOneById
      .mockResolvedValue( {
        ...fixtureEpisodes.SampleSeries.Samples.EP1x01,
        series: SERIES_SAMPLE_SERIES,
        fileInfos: [fixtureEpisodeFileInfos.SampleSeries.Samples.EP1x01],
      } );

    // User
    await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles as UserPayload);

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
      ],
      controllers: [PlayEpisodeController],
      providers: [
        getOrCreateMockProvider(PlayEpisodeService), // para PlayVideoService
        getOrCreateMockProvider(AuthPlayerService), // para PlayEpisodeController
        getOrCreateMockProvider(EpisodesRepository),
      ],
    }, {
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    routerApp = testingSetup.routerApp;

    mocks = await initMocks(testingSetup);
  } );

  beforeEach(()=> {
    jest.clearAllMocks();
  } );

  const validControllerUrl = `/play/${remotePlayerId}/episode`;
  const invalidControllerUrl = "/play/invalidRemotePlayerId/episode";

  it("invalid controller params", async () => {
    const response = await request(routerApp)
      .get(invalidControllerUrl + "/sample-series/1x01");

    expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  } );

  describe("playEpisode", () => {
    const validUrl = `${validControllerUrl}/sample-series/1x01`;

    it("should not return 422 if params are valid", async () => {
      const res = await request(routerApp)
        .get(validUrl);

      expect(res.statusCode).not.toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should return 422 if episode not found", async () => {
      mocks.episodesRepo.getOneBySeriesKeyAndEpisodeKey
        .mockResolvedValueOnce(null);
      const res = await request(routerApp)
        .get(validUrl);

      expect(res).toBeDefined();
      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("should return 200 if episode found", async () => {
      const res = await request(routerApp)
        .get(validUrl);

      expect(mocks.playVideoService.playEpisode).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );
  } );
} );
