import { Application } from "express";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { HttpStatus } from "@nestjs/common";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { ImageCoversRepository } from "#modules/image-covers/crud/repositories";
import { ImageCoversUploadService, UploadFileInterceptor } from "../service";
import { ImageCoverUploadController } from "../controller";
import { fileBuffer, mockFileInMemory, uploadImage } from "./utils";
import { MemoryUploadFileInterceptor } from "./MemoryUploadFile.interceptor";

describe("imageCoverCrudController (upload)", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let repoMock: jest.Mocked<ImageCoversRepository>;
  let uploadServiceMock: jest.Mocked<ImageCoversUploadService>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [ImageCoverUploadController],
      providers: [
        getOrCreateMockProvider(ImageCoversUploadService),
        getOrCreateMockProvider(ImageCoversRepository),
      ],
    }, {
      beforeCompile: (builder) => {
        builder.overrideInterceptor(UploadFileInterceptor)
          .useClass(MemoryUploadFileInterceptor);
      },
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    routerApp = testingSetup.routerApp;

    uploadServiceMock = testingSetup.getMock(ImageCoversUploadService);
    repoMock = testingSetup.getMock(ImageCoversRepository);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  describe("uploadFile", ()=> {
    it("should call upload service", async () => {
      const metadata = {
        label: "New Cover Album",
      } satisfies ImageCoverCrudDtos.UploadFile.RequestBody["metadata"];
      const res = await uploadImage( {
        fileBuffer,
        metadata,
        routerApp,
      } );

      expect(uploadServiceMock.upload).toHaveBeenCalled();
      expect(uploadServiceMock.upload).toHaveBeenCalledWith(
        {
          file: mockFileInMemory,
          uploadDto: {
            metadata,
          },
          uploaderUserId: fixtureUsers.Admin.User.id,
        },
      );

      // Significa que llama al validador de schema en la respuesta
      expect(JSON.stringify(res.body)).toContain("Required");
    } );

    it("falla si el tipo MIME no es permitido", async () => {
      const fakeTextBuffer = Buffer.from("esto es texto, no una imagen");
      const metadataPayload = {
        label: "Invalid File",
      };
      const res = await uploadImage( {
        routerApp,
        fileBuffer: fakeTextBuffer,
        options: {
          filename: "document.txt",
          contentType: "text/plain",
        },
        metadata: metadataPayload,
      } );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);

      expect(uploadServiceMock.upload).not.toHaveBeenCalled();
    } );

    it("falla si faltan datos requeridos en el DTO (label)", async () => {
      const invalidMetadata = null;
      const res = await uploadImage( {
        routerApp,
        options: {
          filename: "valid.png",
          contentType: "image/png",
        },
        fileBuffer,
        metadata: invalidMetadata!,
      } );

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );

    it("falla si no se adjunta ningún archivo", async () => {
      const metadataPayload = {
        label: "No File",
      };
      const res = await uploadImage( {
        routerApp,
        metadata: metadataPayload,
        fileBuffer: null!,
      } );

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    } );

    it("should not upload a normal user", async () => {
      const metadata = {
        label: "Normal User",
      } satisfies ImageCoverCrudDtos.UploadFile.RequestBody["metadata"];

      await testingSetup.useMockedUser(fixtureUsers.Normal.UserWithRoles);
      const res = await uploadImage( {
        fileBuffer,
        metadata,
        routerApp,
      } );

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);

      expect(uploadServiceMock.upload).not.toHaveBeenCalled();
    } );

    it("should not upload by guest user", async () => {
      const metadata = {
        label: "Guest User",
      } satisfies ImageCoverCrudDtos.UploadFile.RequestBody["metadata"];

      await testingSetup.useMockedUser(null);
      const res = await uploadImage( {
        fileBuffer,
        metadata,
        routerApp,
      } );

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);

      expect(uploadServiceMock.upload).not.toHaveBeenCalled();
    } );
  } );
} );
