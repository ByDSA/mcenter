import request, { Response } from "supertest";
import { Application } from "express";
import { HttpStatus } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { createMockedModule } from "#utils/nestjs/tests";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeFileInfosCrudModule } from "#episodes/file-info/crud/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { StreamFileModule } from "#modules/resources/stream-file/module";
import { EpisodeResponseFormatterModule } from "#episodes/renderer/module";
import { createTokenTests } from "#core/auth/strategies/token/tests";
import { EpisodesSlugController } from "./controller";
import { EpisodeSlugHandlerService } from "./service";
import { EpisodesRepository } from "#episodes/crud/episodes/repository";

const EPISODE_WITH_SERIE = {
  ...fixtureEpisodes.SampleSeries.Samples.EP1x01,
  series: SERIES_SAMPLE_SERIES,
};

describe("responses", () => {
  let testingSetup: TestingSetup;
  const validSerieKey = "seriesKey";
  const validEpisodeKey = "episodeKey";
  let router: Application;
  let repo: jest.Mocked<EpisodesRepository>;
  const URL = "/" + validSerieKey + "/" + validEpisodeKey;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        EpisodeResponseFormatterModule,
        createMockedModule(EpisodeHistoryCrudModule),
        createMockedModule(EpisodeFileInfosCrudModule),
        createMockedModule(EpisodesCrudModule),
        createMockedModule(StreamFileModule)],
      controllers: [EpisodesSlugController],
      providers: [
        EpisodeSlugHandlerService,
      ],
    }, {
      auth: {
        repositories: "mock",
      },
    } );

    router = testingSetup.routerApp;
    repo = testingSetup.getMock(EpisodesRepository);
    repo.getOneBySlug.mockResolvedValue(EPISODE_WITH_SERIE);
  } );

  it("default response json", async () => {
    const res = await request(router)
      .get(URL)
      .expect(HttpStatus.OK);

    expectWithEpisode(res, EPISODE_WITH_SERIE);
  } );

  createTokenTests( {
    getTestingSetup: ()=>testingSetup,
    expectedUser: fixtureUsers.Normal.UserWithRoles,
    getRouter: ()=>router,
    url: URL,
  } );

  it("response json", async () => {
    const res = await request(router)
      .get(URL + "?format=json")
      .expect(HttpStatus.OK);

    expectWithEpisode(res, EPISODE_WITH_SERIE);
  } );

  it("response m3u8", async () => {
    const res = await request(router)
      .get(URL + "?format=m3u8")
      .expect(HttpStatus.OK);
    const ep = fixtureEpisodes.SampleSeries.Samples.EP1x01;
    const host = getHostFromSuperTestRequest(res.request);
    const path = PATH_ROUTES.episodes.withParams(ep.id);

    expect(res.text).toContain(`${host}${path}`);
  } );

  it("response raw", async () => {
    repo.getOneBySlug.mockResolvedValueOnce(
      {
        ...fixtureEpisodes.SampleSeries.Samples.EP1x01,
        fileInfos: [
          fixtureEpisodeFileInfos.SampleSeries.Samples.EP1x01,
        ],
        series: SERIES_SAMPLE_SERIES,
      },
    );
    await request(router)
      .get(URL + "?format=raw")
      .expect(HttpStatus.OK);
  } );
} );

function expectWithEpisode(res: Response, expectedEpisode: EpisodeEntity) {
  const episodeDto = res.body.data;
  const episode = episodeEntitySchema.parse(episodeDto);

  expect(episode).toMatchObject(expectedEpisode);
}

function getHostFromSuperTestRequest(req: request.Request): string {
  const url = new URL(req.url);

  return `${url.protocol}//${url.host}`;
}
