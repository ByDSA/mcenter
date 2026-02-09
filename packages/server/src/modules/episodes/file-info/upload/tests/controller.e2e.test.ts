import * as fs from "fs";
import path from "path";
import { Application } from "express";
import supertest from "supertest";
import { HttpStatus } from "@nestjs/common";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { loadFixtureSampleSeriesWithoutEpisodes } from "#core/db/tests/fixtures/sets/SampleSeries";
import { EPISODES_MEDIA_PATH } from "#episodes/utils";
import { EpisodeFileInfosUploadModule } from "../module";
import { EPISODES_MEDIA_UPLOAD_FOLDER_PATH } from "../utils";
import { uploadEpisodeFile } from "./utils";

const sampleFileName = "sample.mp4";
const sampleFile = Buffer.from(fs.readFileSync(EPISODES_MEDIA_PATH + "/" + sampleFileName));

describe("episodeFileInfoUploadController E2E", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [EpisodeFileInfosUploadModule],
      },
      {
        db: {
          using: "real",
        },
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    await loadFixtureSampleSeriesWithoutEpisodes();

    await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    routerApp = testingSetup.routerApp;
  } );

  afterAll(() => {
    const seriesTestPath = path.join(EPISODES_MEDIA_PATH, "e2e-test-series");

    fs.rmSync(seriesTestPath, {
      recursive: true,
      force: true,
    } );
    fs.rmSync(EPISODES_MEDIA_UPLOAD_FOLDER_PATH, {
      recursive: true,
      force: true,
    } );
  } );

  describe("uploadFile (Crear nuevo episodio)", () => {
    let res: supertest.Response;
    let body: EpisodeFileInfoCrudDtos.UploadFile.Response;
    const seriesId = SERIES_SAMPLE_SERIES.id;
    const episodeKey = "1x01";
    const metadata: EpisodeFileInfoCrudDtos.UploadFile.RequestBody["metadata"] = {
      seriesId,
      episodeKey,
      title: "Pilot Episode E2E",
    };

    beforeAll(async () => {
      res = await uploadEpisodeFile( {
        fileBuffer: sampleFile,
        routerApp,
        metadata,
        options: {
          filename: sampleFileName,
        },
      } );

      body = res.body;
    } );

    it("should return 200 OK", () => {
      expect(res.status).toBe(HttpStatus.OK);
    } );

    it("should return valid response schema", () => {
      expect(() => {
        EpisodeFileInfoCrudDtos.UploadFile.responseSchema.parse(body);
      } ).not.toThrow();
    } );

    it("should create the episode and file info in DB", () => {
      expect(body.data.episode).toBeDefined();
      expect(body.data.fileInfo).toBeDefined();

      expect(body.data.episode?.seriesId).toBe(seriesId);
      expect(body.data.episode?.episodeKey).toBe(episodeKey);
      expect(body.data.fileInfo.episodeId).toBe(body.data.episode?.id);
    } );

    it("should save the file on disk in the correct folder structure", () => {
      // La lógica del servicio es: EPISODES_MEDIA_PATH / seriesKey / season / filename
      // Para "1x01", la temporada es "1"
      const season = "1";
      const relativePath = body.data.fileInfo.path;

      // Verificamos que el path relativo devuelto tenga sentido
      expect(relativePath).toContain(SERIES_SAMPLE_SERIES.key);
      expect(relativePath).toContain(season);

      const absolutePathCheck = path.join(EPISODES_MEDIA_PATH, relativePath);

      expect(fs.existsSync(absolutePathCheck)).toBeTruthy();
    } );
  } );
} );
