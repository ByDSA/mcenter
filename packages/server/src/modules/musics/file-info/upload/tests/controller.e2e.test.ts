import * as fs from "fs";
import path from "path";
import { Application } from "express";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { HttpStatus } from "@nestjs/common";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import supertest from "supertest";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { MUSIC_MEDIA_PATH } from "#musics/utils";
import { MUSIC_DATA_FOLDER } from "#tests/MusicData";
import { MusicFileInfoUploadModule } from "../module";
import { uploadMusic } from "./utils";

const tempFilePath = path.join(process.cwd(), MUSIC_DATA_FOLDER, "..", "sample.mp3");

if (!fs.existsSync(tempFilePath))
  fs.writeFileSync(tempFilePath, "FAKE ID3 CONTENT AND AUDIO FRAME");

const sampleFile = fs.readFileSync(tempFilePath);

describe("controller E2E", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        imports: [MusicFileInfoUploadModule],
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

    await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    routerApp = testingSetup.routerApp;
  } );

  afterAll(async () => {
    // Limpiar carpeta de uploads creada por el test
    const uploadFolder = path.join(MUSIC_MEDIA_PATH, "upload");

    if (fs.existsSync(uploadFolder)) {
      fs.rmSync(uploadFolder, {
        recursive: true,
        force: true,
      } );
    }

    // Cerrar app
    await testingSetup.app.close();
  } );

  describe("subida de nuevo archivo (Crear Música)", () => {
    let res: supertest.Response;
    let body: MusicFileInfoCrudDtos.UploadFile.Response;

    beforeAll(async () => {
      res = await uploadMusic( {
        fileBuffer: sampleFile,
        metadata: {}, // Sin musicId -> crea nueva música
        routerApp,
        options: {
          filename: "e2e-song.mp3",
        },
      } );
      body = res.body;
    } );

    it("devuelve respuesta 201/200 OK", () => {
      expect(res.status).toBe(HttpStatus.OK);
    } );

    it("la respuesta cumple el esquema DTO", () => {
      expect(() => {
        MusicFileInfoCrudDtos.UploadFile.responseSchema.parse(body);
      } ).not.toThrow();
    } );

    it("crea la entidad Music y FileInfo", () => {
      expect(body.data.music).toBeDefined();
      expect(body.data.fileInfo).toBeDefined();
      expect(body.data.fileInfo.musicId).toBe(body.data.music?.id);
    } );

    it("el archivo existe físicamente en la carpeta de medios", () => {
      const relativePath = body.data.fileInfo.path;
      const fullPath = path.join(MUSIC_MEDIA_PATH, relativePath);

      expect(fs.existsSync(fullPath)).toBeTruthy();
    } );
  } );
} );
