import request, { Response } from "supertest";
import { Application } from "express";
import { HttpStatus } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity } from "$sharedSrc/models/musics/music";
import { fixtureMusicFileInfos } from "$sharedSrc/models/musics/file-info/tests/fixtures";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { createTestingAppModuleAndInit, type TestingSetup } from "#core/app/tests/app";
import { MusicDtos } from "#musics/models/dto";
import { createMockedModule, getOrCreateMockProvider } from "#utils/nestjs/tests";
import { expectControllerFinishRequest, createTokenTests } from "#core/auth/strategies/token/tests";
import { fixtureMusics } from "../tests";
import { MusicsRepository } from "../crud/repositories/music";
import { MusicsCrudModule } from "../crud/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicFlowService } from "../MusicFlow.service";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicResponseFormatterService } from "../renderer/formatter.service";
import { MusicsSlugController } from "./controller";

describe("musicsSlugController integration (controller + render + MusicFlowService)", () => {
  let testingSetup: TestingSetup;
  let router: Application;
  let mocks: Awaited<ReturnType<typeof initMocks>>;
  const URL = "/slug";

  function initMocks() {
    const ret = {
      musicRepo: testingSetup.getMock(MusicsRepository),
    };

    return ret;
  }

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [
        createMockedModule(MusicsCrudModule),
        MusicRendererModule,
      ],
      controllers: [MusicsSlugController],
      providers: [],
    }, {
      auth: {
        repositories: "mock",
      },
      beforeCompile: (builder)=> {
        builder
          .overrideProvider(MusicFlowService)
          .useValue(new MusicFlowService(
            getOrCreateMockProvider(MusicHistoryRepository).useValue,
            getOrCreateMockProvider(MusicResponseFormatterService).useValue,
          ));
      },
    } );

    router = testingSetup.routerApp;
    mocks = initMocks();
  } );

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.musicRepo.getOneBySlug.mockResolvedValue(fixtureMusics.Disk.Samples.DK);
  } );

  describe("getRaw (GET /:slug)", () => {
    it("default response json", async () => {
      const res = await request(router)
        .get(URL)
        .expect(HttpStatus.OK);

      expectWithMusic(res, fixtureMusics.Disk.Samples.DK);
      expectControllerFinishRequest();
    } );

    it("response json", async () => {
      const res = await request(router)
        .get(URL + "?format=json")
        .expect(HttpStatus.OK);

      expectWithMusic(res, fixtureMusics.Disk.Samples.DK);
      expectControllerFinishRequest();
    } );

    it("response m3u8", async () => {
      const res = await request(router)
        .get(URL + "?format=m3u8")
        .expect(HttpStatus.OK);
      const music = fixtureMusics.Disk.Samples.DK;
      const host = getHostFromSuperTestRequest(res.request);
      const path = PATH_ROUTES.musics.slug.withParams(music.slug);

      expect(res.text).toContain(`${host}${path}`);

      expectControllerFinishRequest();
    } );

    it("response raw", async () => {
      mocks.musicRepo.getOneBySlug.mockResolvedValueOnce(
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

      expectControllerFinishRequest();
    } );

    describe("authentication", () => {
      createTokenTests( {
        url: URL,
        expectedUser: fixtureUsers.Normal.UserWithRoles,
      } );
    } );

    describe("repositories", () => {
      it("should call repository with correct slug", async () => {
        const slug = "test-slug";

        await request(router).get(`/${slug}`);

        expect(mocks.musicRepo.getOneBySlug).toHaveBeenCalled();
      } );

      it("should call repository with fileInfos when format is raw", async () => {
        mocks.musicRepo.getOneBySlug.mockResolvedValueOnce( {
          ...fixtureMusics.Disk.Samples.DK,
          fileInfos: [fixtureMusicFileInfos.Disk.Samples.DK],
        } );

        await request(router).get("/test-slug?format=raw");

        expect(mocks.musicRepo.getOneBySlug).toHaveBeenCalled();
      } );
    } );
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
