import { Application } from "express";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { HttpStatus } from "@nestjs/common";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { MusicFileInfoUploadController } from "../controller";
import { MusicFileInfoUploadRepository, UploadFileInterceptor } from "../service";
import { MusicFileInfoRepository } from "../../crud/repository";
import { fileBuffer, mockFileInMemory, uploadMusic } from "./utils";
import { MemoryUploadFileInterceptor } from "./MemoryUploadFile.interceptor";

describe("controller", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let uploadServiceMock: jest.Mocked<MusicFileInfoUploadRepository>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [MusicFileInfoUploadController],
        providers: [
          getOrCreateMockProvider(MusicFileInfoUploadRepository),
          getOrCreateMockProvider(MusicFileInfoRepository),
        ],
      },
      {
        beforeCompile: (builder) => {
          builder
            .overrideInterceptor(UploadFileInterceptor)
            .useClass(MemoryUploadFileInterceptor);
        },
        auth: {
          repositories: "mock",
          cookies: "mock",
        },
      },
    );

    await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    routerApp = testingSetup.routerApp;
    uploadServiceMock = testingSetup.getMock(MusicFileInfoUploadRepository);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("uploadFile", () => {
    it("debería llamar al servicio de upload correctamente", async () => {
      const metadata = {
        musicId: "some-id",
      } satisfies MusicFileInfoCrudDtos.UploadFile.RequestBody["metadata"];
      const res = await uploadMusic( {
        fileBuffer,
        metadata,
        routerApp,
      } );

      expect(uploadServiceMock.upload).toHaveBeenCalledWith( {
        file: mockFileInMemory,
        uploadDto: {
          metadata,
        },
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      // Significa que llama al validador de schema en la respuesta
      expect(JSON.stringify(res.body)).toContain("Required");
    } );

    it("falla si el tipo MIME no es de audio permitido", async () => {
      const fakeTextBuffer = Buffer.from("esto es texto, no audio");
      const metadata = {};
      const res = await uploadMusic( {
        routerApp,
        fileBuffer: fakeTextBuffer,
        options: {
          filename: "document.txt",
          contentType: "text/plain",
        },
        metadata,
      } );

      // El interceptor debería rechazarlo antes de llegar al controlador
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(uploadServiceMock.upload).not.toHaveBeenCalled();
    } );

    it("falla si no se adjunta archivo", async () => {
      const res = await uploadMusic( {
        routerApp,
        metadata: {},
        fileBuffer: null!, // Simulamos no enviar archivo
      } );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    } );

    it("debería denegar acceso a usuarios normales (si está protegido por IsAdmin)", async () => {
      // Asumiendo que el controlador usa @IsAdmin o similar para uploads
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await uploadMusic( {
        fileBuffer,
        metadata: {},
        routerApp,
      } );

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(uploadServiceMock.upload).not.toHaveBeenCalled();
    } );

    it("debería denegar acceso a invitados", async () => {
      await testingSetup.useMockedUser(null);

      const res = await uploadMusic( {
        fileBuffer,
        metadata: {},
        routerApp,
      } );

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    } );
  } );
} );
