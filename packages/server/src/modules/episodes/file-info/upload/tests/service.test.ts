import fs from "node:fs";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { EpisodeFileInfoEntity } from "$shared/models/episodes/file-info";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import * as cryptUtils from "#utils/crypt";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { VideoMetadataService } from "#modules/resources/video/video-metadata/VideoMetadataService.service";
import { EpisodeEntity } from "#episodes/models";
import { EpisodeFileInfoRepository } from "#episodes/file-info/crud/repository";
import { fixtureEpisodes } from "#episodes/tests";
import { fixtureEpisodeFileInfos } from "#episodes/file-info/tests";
import { SeriesRepository } from "#episodes/series/crud/repository";
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
    seriesId: mockEpisodeEntity.seriesId,
    episodeKey: mockEpisodeEntity.episodeKey,
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
  let seriesRepoMock: jest.Mocked<SeriesRepository>;
  let videoMetadataMock: jest.Mocked<VideoMetadataService>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [],
      providers: [
        EpisodeFileInfoUploadService,
        getOrCreateMockProvider(EpisodeFileInfoRepository),
        getOrCreateMockProvider(SeriesRepository),
        getOrCreateMockProvider(EpisodesRepository),
        getOrCreateMockProvider(VideoMetadataService),
      ],
    } );

    fileInfoRepoMock = testingSetup.getMock(EpisodeFileInfoRepository);
    episodesRepoMock = testingSetup.getMock(EpisodesRepository);
    videoMetadataMock = testingSetup.getMock(VideoMetadataService);
    seriesRepoMock = testingSetup.getMock(SeriesRepository);
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
      seriesRepoMock.getOneById.mockResolvedValue(SERIES_SAMPLE_SERIES);

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
      seriesRepoMock.getOneById.mockResolvedValue(SERIES_SAMPLE_SERIES);
      fileInfoRepoMock.getManyByHash.mockResolvedValue([mockFileInfoEntity]);

      await expect(service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithEpisodeId,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } )).rejects.toThrow();
    } );
  } );

  describe("subida usando seriesId y episodeKey", () => {
    it("debería encontrar episodio existente y subir archivo", async () => {
      episodesRepoMock.getOne.mockResolvedValue(mockEpisodeEntity);
      seriesRepoMock.getOneById.mockResolvedValue(SERIES_SAMPLE_SERIES);

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

    it("debería fallar si no existe la serie con seriesId", async () => {
      episodesRepoMock.getOne.mockResolvedValue(mockEpisodeEntity);
      seriesRepoMock.getOneById.mockResolvedValue(null);

      await expect(service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithKeys,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } )).rejects.toThrow();

      expect(episodesRepoMock.getOne).toHaveBeenCalled();
      expect(episodesRepoMock.createOneAndGet).not.toHaveBeenCalled();
      expect(fileInfoRepoMock.createOneAndGet).not.toHaveBeenCalled();
    } );

    it("debería crear el episodio si no existe y luego subir archivo", async () => {
      episodesRepoMock.getOne.mockResolvedValue(null);
      seriesRepoMock.getOneById.mockResolvedValue(SERIES_SAMPLE_SERIES);
      episodesRepoMock.createOneAndGet.mockResolvedValue(mockEpisodeEntity);

      const ret = await service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithKeys,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      expect(episodesRepoMock.getOne).toHaveBeenCalled();
      expect(episodesRepoMock.createOneAndGet).toHaveBeenCalledWith(expect.objectContaining( {
        seriesId: mockEpisodeEntity.seriesId,
        episodeKey: mockEpisodeEntity.episodeKey,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } ));
      expect(fileInfoRepoMock.createOneAndGet).toHaveBeenCalled();
      expect(ret.data.episode).toEqual(mockEpisodeEntity);
    } );

    it("debería usar el título proporcionado en metadatos al crear episodio", async () => {
      episodesRepoMock.getOne.mockResolvedValue(null);
      seriesRepoMock.getOneById.mockResolvedValue(SERIES_SAMPLE_SERIES);
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
