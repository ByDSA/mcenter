import { Application } from "express";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { HttpStatus } from "@nestjs/common";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { createMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { mockMongoId } from "#tests/mongo";
import { EpisodeFileInfosUploadController } from "../controller";
import { EpisodeFileInfoUploadService, UploadFileInterceptor } from "../service";
import { EpisodeFileInfoRepository } from "../../crud/repository";
import { fileBuffer, mockFileInMemory, uploadEpisodeFile } from "./utils";
import { MemoryUploadFileInterceptor } from "./MemoryUploadFile.interceptor";

const metadataWithEpisodeId = {
  episodeId: mockMongoId,
} satisfies EpisodeFileInfoCrudDtos.UploadFile.RequestBody["metadata"];

describe("controller", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let uploadServiceMock: jest.Mocked<EpisodeFileInfoUploadService>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit(
      {
        controllers: [EpisodeFileInfosUploadController],
        providers: [
          createMockProvider(EpisodeFileInfoUploadService),
          createMockProvider(EpisodeFileInfoRepository),
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
    uploadServiceMock = testingSetup.getMock(EpisodeFileInfoUploadService);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("uploadFile", () => {
    it("debería llamar al servicio de upload correctamente", async () => {
      const res = await uploadEpisodeFile( {
        fileBuffer,
        metadata: metadataWithEpisodeId,
        routerApp,
      } );

      expect(uploadServiceMock.upload).toHaveBeenCalled();
      expect(uploadServiceMock.upload).toHaveBeenCalledWith( {
        file: mockFileInMemory,
        uploadDto: {
          metadata: metadataWithEpisodeId,
        },
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      // Significa que llama al validador de schema en la respuesta
      expect(JSON.stringify(res.body)).toContain("Required");
    } );

    describe("uploadEpisodeFile - Invalid Metadata", () => {
      const cases: {
    metadata: EpisodeFileInfoCrudDtos.UploadFile.RequestBody["metadata"];
    description?: string;
  }[] = [
    {
      metadata: {} as any,
      description: "fails if metadata is empty",
    },
    {
      metadata: {
        episodeId: "invalid id",
      },
    },
    {
      metadata: {
        episodeKey: "falta-series-key",
      } as any,
    },
    {
      metadata: {
        seriesKey: "falta-episode-key",
      } as any,
    },
    {
      metadata: {
        episodeId: mockMongoId,
        episodeKey: "sobra",
      },
    },
    {
      metadata: {
        episodeId: mockMongoId,
        seriesKey: "sobra",
      },
    },
    {
      metadata: {
        episodeId: mockMongoId,
        episodeKey: "sobra",
        seriesKey: "sobra",
      },
    },
  ];

      describe.each(cases)("$description", ( { metadata } ) => {
        it("should return UNPROCESSABLE_ENTITY and not call the service", async () => {
          const res = await uploadEpisodeFile( {
            routerApp,
            fileBuffer,
            metadata,
          } );

          expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(uploadServiceMock.upload).not.toHaveBeenCalled();
        } );
      } );
    } );

    it("falla si el tipo MIME no es de video permitido", async () => {
      const fakeTextBuffer = Buffer.from("esto es texto, no video");
      const metadata = {
        episodeId: "some-id",
      };
      const res = await uploadEpisodeFile( {
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
      const res = await uploadEpisodeFile( {
        routerApp,
        metadata: metadataWithEpisodeId,
        fileBuffer: null!, // Simulamos no enviar archivo
      } );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    } );

    it("debería denegar acceso a usuarios normales (si está protegido por IsAdmin)", async () => {
      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);

      const res = await uploadEpisodeFile( {
        fileBuffer,
        metadata: metadataWithEpisodeId,
        routerApp,
      } );

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(uploadServiceMock.upload).not.toHaveBeenCalled();
    } );
  } );
} );
