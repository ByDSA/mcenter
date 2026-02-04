import fs from "node:fs";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { EpisodeFileInfoEntity } from "$shared/models/episodes/file-info";
import { createMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import * as cryptUtils from "#utils/crypt";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { VideoMetadataService } from "#modules/resources/video/video-metadata/VideoMetadataService.service";
import { EpisodeEntity } from "#episodes/models";
import { EpisodeFileInfoRepository } from "#episodes/file-info/crud/repository";
import { fixtureEpisodes } from "#episodes/tests";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { EpisodeFileInfoUploadService } from "../service";
import { mockFile } from "./utils";

// Mock Data
const existingEpisodeId = "episode_123";
const uploadDtoWithEpisodeId: EpisodeFileInfoCrudDtos.UploadFile.RequestBody = {
  metadata: {
    episodeId: existingEpisodeId,
  },
};
const mockEpisodeEntity = fixtureEpisodes.Simpsons.Samples.EP1x01 as EpisodeEntity;
const mockFileInfoEntity: EpisodeFileInfoEntity = fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01;
const uploadDtoWithKeys: EpisodeFileInfoCrudDtos.UploadFile.RequestBody = {
  metadata: {
    seriesKey: mockEpisodeEntity.compKey.seriesKey,
    episodeKey: mockEpisodeEntity.compKey.episodeKey,
  },
};
const mockVideoInfo = {
  size: fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01.size,
  hash: fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01.hash,
  timestamps: fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01.timestamps,
  mediaInfo: fixtureEpisodeFileInfos.Simpsons.Samples.EP1x01.mediaInfo,
};

describe("episodeFileInfoUploadService", () => {
  let testingSetup: TestingSetup;
  let service: EpisodeFileInfoUploadService;
  let fileInfoRepoMock: jest.Mocked<EpisodeFileInfoRepository>;
  let episodesRepoMock: jest.Mocked<EpisodesRepository>;
  let videoMetadataMock: jest.Mocked<VideoMetadataService>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [],
      providers: [
        EpisodeFileInfoUploadService,
        createMockProvider(EpisodeFileInfoRepository),
        createMockProvider(EpisodesRepository),
        createMockProvider(VideoMetadataService),
      ],
    } );

    fileInfoRepoMock = testingSetup.getMock(EpisodeFileInfoRepository);
    episodesRepoMock = testingSetup.getMock(EpisodesRepository);
    videoMetadataMock = testingSetup.getMock(VideoMetadataService);
    service = testingSetup.module.get(EpisodeFileInfoUploadService);

    // Mocks de sistema
    jest.spyOn(fs.promises, "rename").mockResolvedValue(undefined);
    jest.spyOn(fs.promises, "mkdir").mockResolvedValue(undefined);
    jest.spyOn(cryptUtils, "md5FileAsync").mockResolvedValue("fakehash");

    // Mock general para evitar errores de directorio y permitir entrar en el if de creación
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
  } );

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks behavior
    videoMetadataMock.getVideoInfo.mockResolvedValue(mockVideoInfo);
    fileInfoRepoMock.createOneAndGet.mockResolvedValue(mockFileInfoEntity);
    fileInfoRepoMock.getManyByHash.mockResolvedValue([]); // No duplicates by default
  } );

  describe("subida usando episodeId", () => {
    it("debería adjuntar el archivo a un episodio existente", async () => {
      episodesRepoMock.getOneById.mockResolvedValue(mockEpisodeEntity);

      const ret = await service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithEpisodeId,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      expect(episodesRepoMock.getOneById).toHaveBeenCalled();
      expect(fileInfoRepoMock.createOneAndGet).toHaveBeenCalled();
      expect(videoMetadataMock.getVideoInfo).toHaveBeenCalled();

      expect(ret.data.episode).toEqual(mockEpisodeEntity);
      expect(ret.data.fileInfo).toEqual(mockFileInfoEntity);
    } );

    it("debería fallar si el archivo es duplicado para el mismo episodio", async () => {
      episodesRepoMock.getOneById.mockResolvedValue(mockEpisodeEntity);
      fileInfoRepoMock.getManyByHash.mockResolvedValue([mockFileInfoEntity]);

      await expect(service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithEpisodeId,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } )).rejects.toThrow();
    } );
  } );

  describe("subida usando seriesKey y episodeKey", () => {
    it("debería encontrar episodio existente y subir archivo", async () => {
      episodesRepoMock.getOne.mockResolvedValue(mockEpisodeEntity);

      const ret = await service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithKeys,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      expect(episodesRepoMock.getOne).toHaveBeenCalled();
      expect(episodesRepoMock.createOneAndGet).not.toHaveBeenCalled();
      expect(fileInfoRepoMock.createOneAndGet).toHaveBeenCalled();
      expect(ret.data.episode).toEqual(mockEpisodeEntity);
    } );

    it("debería crear el episodio si no existe y luego subir archivo", async () => {
      episodesRepoMock.getOne.mockResolvedValue(null);
      episodesRepoMock.createOneAndGet.mockResolvedValue(mockEpisodeEntity);

      const ret = await service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithKeys,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      expect(episodesRepoMock.getOne).toHaveBeenCalled();
      expect(episodesRepoMock.createOneAndGet).toHaveBeenCalledWith(expect.objectContaining( {
        compKey: mockEpisodeEntity.compKey,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } ));
      expect(fileInfoRepoMock.createOneAndGet).toHaveBeenCalled();
      expect(ret.data.episode).toEqual(mockEpisodeEntity);
    } );

    it("debería usar el título proporcionado en metadatos al crear episodio", async () => {
      episodesRepoMock.getOne.mockResolvedValue(null);
      episodesRepoMock.createOneAndGet.mockResolvedValue(mockEpisodeEntity);

      const customTitle = "Mi Titulo Personalizado";
      const customDto = {
        metadata: {
          ...uploadDtoWithKeys.metadata,
          title: customTitle,
        },
      } as EpisodeFileInfoCrudDtos.UploadFile.RequestBody;

      await service.upload( {
        file: mockFile,
        uploadDto: customDto,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      expect(episodesRepoMock.createOneAndGet).toHaveBeenCalledWith(expect.objectContaining( {
        title: customTitle,
      } ));
    } );
  } );
} );
