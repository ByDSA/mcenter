import request, { Response } from "supertest";
import { Application } from "express";
import { HttpStatus } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { fixtureEpisodes } from "#episodes/tests";
import { createTestingAppModuleAndInit } from "#core/app/tests/app";
import { EpisodeDtos } from "#episodes/models/dto";
import { EpisodeEntity } from "#episodes/models";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { episodeHistoryRepositoryMockProvider } from "#episodes/history/crud/repository/tests";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodesRepository } from "../crud/repository";
import { episodeRepositoryMockProvider } from "../crud/repository/tests";
import { EpisodesSlugModule } from "./module";

describe("responses", () => {
  let router: Application;
  let repo: jest.Mocked<EpisodesRepository>;
  const URL = "/serie/episode";

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
          .useValue(episodeRepositoryMockProvider.useValue);

        builder
          .overrideProvider(EpisodeHistoryRepository)
          .useValue(episodeHistoryRepositoryMockProvider.useValue);
      },
    } );

    router = testingSetup.routerApp;
    repo = testingSetup.module.get(EpisodesRepository);
    repo.getOneByCompKey.mockResolvedValue(fixtureEpisodes.Simpsons.Samples.EP1x01);
  } );

  it("default response json", async () => {
    const res = await request(router)
      .get(URL)
      .expect(HttpStatus.OK);

    expectWithEpisode(res, fixtureEpisodes.Simpsons.Samples.EP1x01);
  } );

  it("response json", async () => {
    const res = await request(router)
      .get(URL + "?format=json")
      .expect(HttpStatus.OK);

    expectWithEpisode(res, fixtureEpisodes.Simpsons.Samples.EP1x01);
  } );

  it("response m3u8", async () => {
    const res = await request(router)
      .get(URL + "?format=m3u8")
      .expect(HttpStatus.OK);
    const ep = fixtureEpisodes.Simpsons.Samples.EP1x01;
    const host = getHostFromSuperTestRequest(res.request);
    const path = PATH_ROUTES.episodes.slug.withParams(ep.compKey.seriesKey, ep.compKey.episodeKey);

    expect(res.text).toContain(`${host}${path}`);
  } );

  it("response raw", async () => {
    repo.getOneByCompKey.mockResolvedValueOnce(
      {
        ...fixtureEpisodes.Simpsons.Samples.EP1x01,
        fileInfos: [
          fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01,
        ],
      },
    );
    await request(router)
      .get(URL + "?format=raw")
      .expect(HttpStatus.OK);
  } );
} );

function expectWithEpisode(res: Response, expectedEpisode: EpisodeEntity) {
  const episodeDto = res.body.data;

  expect(episodeDto).toBeDefined();

  const episode = EpisodeDtos.Entity.toEntity(episodeDto);

  expect(episode).toStrictEqual(expectedEpisode);
}

function getHostFromSuperTestRequest(req: request.Request): string {
  const url = new URL(req.url);

  return `${url.protocol}//${url.host}`;
}
