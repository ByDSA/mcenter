import request, { Response } from "supertest";
import { Application } from "express";
import { HttpStatus } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity } from "$sharedSrc/models/musics/music";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { createTestingAppModuleAndInit } from "#core/app/tests/app";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { MusicDtos } from "#musics/models/dto";
import { fixtureMusics } from "../tests";
import { MusicsRepository } from "../crud/repositories/music";
import { musicsRepoMockProvider } from "../crud/repositories/music/tests";
import { musicHistoryRepoMockProvider } from "../history/crud/repository/tests";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicsSlugModule } from "./module";

describe("responses", () => {
  let router: Application;
  let repo: jest.Mocked<MusicsRepository>;
  const URL = "/slug";

  beforeAll(async () => {
    const testingSetup = await createTestingAppModuleAndInit( {
      imports: [ResourceResponseFormatterModule, MusicsSlugModule],
      controllers: [],
      providers: [
      ],
    }, {
      beforeCompile: (builder)=> {
        builder
          .overrideProvider(MusicsRepository)
          .useClass(musicsRepoMockProvider.useClass);

        builder
          .overrideProvider(MusicHistoryRepository)
          .useClass(musicHistoryRepoMockProvider.useClass);
      },
    } );

    router = testingSetup.routerApp;
    repo = testingSetup.module.get(MusicsRepository);
    repo.getOneBySlug.mockResolvedValue(fixtureMusics.Disk.Samples.DK);
  } );

  it("default response json", async () => {
    const res = await request(router)
      .get(URL)
      .expect(HttpStatus.OK);

    expectWithMusic(res, fixtureMusics.Disk.Samples.DK);
  } );

  it("response json", async () => {
    const res = await request(router)
      .get(URL + "?format=json")
      .expect(HttpStatus.OK);

    expectWithMusic(res, fixtureMusics.Disk.Samples.DK);
  } );

  it("response m3u8", async () => {
    const res = await request(router)
      .get(URL + "?format=m3u8")
      .expect(HttpStatus.OK);
    const music = fixtureMusics.Disk.Samples.DK;
    const host = getHostFromSuperTestRequest(res.request);
    const path = PATH_ROUTES.musics.slug.withParams(music.slug);

    expect(res.text).toContain(`${host}${path}`);
  } );

  it("response raw", async () => {
    repo.getOneBySlug.mockResolvedValueOnce(
      {
        ...fixtureMusics.Disk.Samples.DK,
        fileInfos: [
          fixtureMusicFileInfos.Disk.Samples.DK,
        ],
      },
    );
    await request(router)
      .get(URL + "?format=raw")
      .expect(HttpStatus.OK)
      .expect("Content-Type", "audio/mpeg");
  } );
} );

function expectWithMusic(res: Response, expectedMusic: MusicEntity) {
  const episodeDto = res.body.data;

  expect(episodeDto).toBeDefined();

  const episode = MusicDtos.Entity.toEntity(episodeDto);

  expect(episode).toStrictEqual(expectedMusic);
}

function getHostFromSuperTestRequest(req: request.Request): string {
  const url = new URL(req.url);

  return `${url.protocol}//${url.host}`;
}
