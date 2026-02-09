import request, { Response } from "supertest";
import { Application } from "express";
import { HttpStatus } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit } from "#core/app/tests/app";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodesSlugModule } from "./module";

const EPISODE_WITH_SERIE = {
  ...fixtureEpisodes.SampleSeries.Samples.EP1x01,
  series: SERIES_SAMPLE_SERIES,
};

describe("responses", () => {
  const validSerieKey = "seriesKey";
  const validEpisodeKey = "episodeKey";
  let router: Application;
  let repo: jest.Mocked<EpisodesRepository>;
  const URL = "/" + validSerieKey + "/" + validEpisodeKey;

  beforeAll(async () => {
    const testingSetup = await createTestingAppModuleAndInit( {
      imports: [EpisodesSlugModule],
      controllers: [],
      providers: [
      ],
    }, {
      beforeCompile: (builder) => {
        builder
          .overrideProvider(EpisodesRepository)
          .useValue(getOrCreateMockProvider(EpisodesRepository).useValue);

        builder
          .overrideProvider(EpisodeHistoryRepository)
          .useValue(getOrCreateMockProvider(EpisodeHistoryRepository).useValue);
      },
    } );

    router = testingSetup.routerApp;
    repo = testingSetup.module.get(EpisodesRepository);
    repo.getOneByEpisodeKeyAndSerieId.mockResolvedValue(EPISODE_WITH_SERIE);
  } );

  it("default response json", async () => {
    const res = await request(router)
      .get(URL)
      .expect(HttpStatus.OK);

    expectWithEpisode(res, EPISODE_WITH_SERIE);
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
    const path = PATH_ROUTES.episodes.slug.withParams(SERIES_SAMPLE_SERIES.key, ep.episodeKey);

    expect(res.text).toContain(`${host}${path}`);
  } );

  it("response raw", async () => {
    repo.getOneBySeriesKeyAndEpisodeKey.mockResolvedValueOnce(
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
