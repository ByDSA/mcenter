import { Application } from "express";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { HttpStatus } from "@nestjs/common";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { ImageCoversRepository } from "#modules/image-covers/crud/repositories";
import { testFailValidation, testManyAuth } from "#core/auth/strategies/token/tests";
import { ImageCoversUploadService, UploadFileInterceptor } from "../service";
import { ImageCoverUploadController } from "../controller";
import { fileBuffer, mockFileInMemory, uploadImage } from "./utils";
import { MemoryUploadFileInterceptor } from "./MemoryUploadFile.interceptor";

describe("imageCoverCrudController (upload)", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
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

    testFailValidation("missing required metadata field (label)", {
      request: () => uploadImage( {
        routerApp,
        options: {
          filename: "valid.png",
          contentType: "image/png",
        },
        fileBuffer,
        metadata: null!,
      } ),
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

    describe("auth", ()=> {
      testManyAuth( {
        request: ()=>{
          const metadata = {
            label: "User",
          } satisfies ImageCoverCrudDtos.UploadFile.RequestBody["metadata"];

          return uploadImage( {
            fileBuffer,
            metadata,
            routerApp,
          } );
        },
        list: [
          {
            user: null,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Normal.UserWithRoles,
            shouldPass: false,
          },
          {
            user: fixtureUsers.Admin.UserWithRoles,
            shouldPass: true,
          },
        ],
      } );
    } );
  } );
} );
