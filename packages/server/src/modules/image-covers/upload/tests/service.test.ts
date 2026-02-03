import fs from "node:fs";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { ImageCoverEntity } from "$shared/models/image-covers";
import { createMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { ImageCoverVersions, ImageVersionsGenerator } from "../generate-versions";
import { mockFile } from "./utils";
import { ImageCoversUploadService } from "../service";
import { ImageCoversRepository } from "#modules/image-covers/crud/repositories";

const uploadDtoWithLabel: ImageCoverCrudDtos.UploadFile.RequestBody = {
  metadata: {
    label: "Label",
  },
};
const metadataPayload = {
  label: "New Cover Album",
} satisfies ImageCoverCrudDtos.UploadFile.RequestBody["metadata"];
const mockCreatedEntity: ImageCoverEntity = {
  id: "img_new_123",
  metadata: {
    label: metadataPayload.label,
  },
  versions: {
    original: "tmp",
  },
  uploaderUserId: fixtureUsers.Admin.UserWithRoles.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockVersions: ImageCoverVersions = {
  original: "23/img_new_123.png",
};
const mockFinalEntity: ImageCoverEntity = {
  ...mockCreatedEntity,
  versions: mockVersions,
};

describe("imageCoverCrudController (upload)", () => {
  let testingSetup: TestingSetup;
  let service: ImageCoversUploadService;
  let repoMock: jest.Mocked<ImageCoversRepository>;
  let generatorMock: jest.Mocked<ImageVersionsGenerator>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [],
      providers: [
        ImageCoversUploadService,
        createMockProvider(ImageCoversRepository),
        createMockProvider(ImageVersionsGenerator),
      ],
    } );

    repoMock = testingSetup.getMock(ImageCoversRepository);
    generatorMock = testingSetup.getMock(ImageVersionsGenerator);
    service = testingSetup.module.get(ImageCoversUploadService);
    jest.spyOn(fs, "renameSync")
      .mockImplementation(undefined);
    jest.spyOn(fs, "existsSync")
      .mockReturnValue(true);
  } );

  beforeEach(()=> {
    jest.clearAllMocks();
  } );

  it("all valid", async () => {
    repoMock.createOneAndGet.mockResolvedValueOnce(mockCreatedEntity);

    generatorMock.generate.mockResolvedValueOnce(mockVersions);

    repoMock.patchOneByIdAndGet.mockResolvedValueOnce(mockFinalEntity);

    const ret = await service.upload( {
      file: mockFile,
      uploadDto: uploadDtoWithLabel,
      uploaderUserId: fixtureUsers.Admin.User.id,
    } );

    expect(fs.renameSync).toHaveBeenCalled();
    expect(generatorMock.generate).toHaveBeenCalled();
    expect(repoMock.patchOneByIdAndGet).toHaveBeenCalled();
    expect(repoMock.createOneAndGet).toHaveBeenCalled();

    ImageCoverCrudDtos.UploadFile.responseSchema.parse(ret);

    expect(ret.data.imageCover.id).toBe("img_new_123");
  } );

  it("should throw error if no provided label nor imageCoverId", async ()=> {
    await expect(
      service.upload( {
        file: mockFile,
        uploadDto: {
          metadata: {},
        },
        uploaderUserId: fixtureUsers.Admin.User.id,
      } ),
    ).rejects.toThrow();
  } );

  it("edit image", async () => {
    repoMock.createOneAndGet.mockResolvedValueOnce(mockCreatedEntity);

    generatorMock.generate.mockResolvedValueOnce(mockVersions);
    repoMock.patchOneByIdAndGet.mockResolvedValueOnce(mockFinalEntity);

    const ret = await service.upload( {
      file: mockFile,
      uploadDto: {
        metadata: {
          imageCoverId: mockCreatedEntity.id,
        },
      },
      uploaderUserId: fixtureUsers.Admin.User.id,
    } );

    expect(repoMock.createOneAndGet).not.toHaveBeenCalled();
    expect(fs.renameSync).toHaveBeenCalled();
    expect(generatorMock.generate).toHaveBeenCalled();
    expect(repoMock.patchOneByIdAndGet).toHaveBeenCalled();

    ImageCoverCrudDtos.UploadFile.responseSchema.parse(ret);

    expect(ret.data.imageCover.id).toBe("img_new_123");
  } );
} );
