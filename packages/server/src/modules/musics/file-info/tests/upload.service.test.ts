import fs from "node:fs";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { MusicEntity } from "$shared/models/musics";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { createMockProvider } from "#utils/nestjs/tests";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import * as cryptUtils from "#utils/crypt";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { MusicFileInfoUploadRepository } from "../upload.service";
import { MusicFileInfoRepository } from "../crud/repository";
import { mockFile } from "./utils";

// Mock Data
const existingMusicId = "music_123";
const uploadDtoWithMusicId: MusicFileInfoCrudDtos.UploadFile.RequestBody = {
  metadata: {
    musicId: existingMusicId,
  },
};
const uploadDtoNewMusic: MusicFileInfoCrudDtos.UploadFile.RequestBody = {
  metadata: {},
};
const mockMusicEntity: MusicEntity = {
  id: existingMusicId,
  title: "Test Song",
  artist: "Test Artist",
  slug: "test-song",
  uploaderUserId: fixtureUsers.Admin.User.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
};
const mockFileInfoEntity: MusicFileInfoEntity = {
  id: "file_123",
  musicId: existingMusicId,
  path: "relative/path/song.mp3",
  hash: "fakehash",
  size: 1024,
  timestamps: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  mediaInfo: {
    duration: 180,
  },
};

describe("musicFileInfoUploadRepository", () => {
  let testingSetup: TestingSetup;
  let service: MusicFileInfoUploadRepository;
  let fileInfoRepoMock: jest.Mocked<MusicFileInfoRepository>;
  let musicRepoMock: jest.Mocked<MusicsRepository>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      controllers: [],
      providers: [
        MusicFileInfoUploadRepository,
        createMockProvider(MusicFileInfoRepository),
        createMockProvider(MusicsRepository),
      ],
    } );

    fileInfoRepoMock = testingSetup.getMock(MusicFileInfoRepository);
    musicRepoMock = testingSetup.getMock(MusicsRepository);
    service = testingSetup.module.get(MusicFileInfoUploadRepository);

    // Mocks de sistema
    jest.spyOn(fs.promises, "rename").mockResolvedValue(undefined);
    jest.spyOn(cryptUtils, "md5FileAsync").mockResolvedValue("fakehash");
  } );

  beforeEach(() => {
    jest.clearAllMocks();
  } );

  it("debería fallar si el hash del archivo ya existe", async () => {
    fileInfoRepoMock.getOneByHash.mockResolvedValueOnce(mockFileInfoEntity);

    await expect(
      service.upload( {
        file: mockFile,
        uploadDto: uploadDtoNewMusic,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } ),
    ).rejects.toThrow("El archivo ya existe");
  } );

  describe("subida para Música Existente (musicId provisto)", () => {
    it("debería adjuntar el archivo a una música existente", async () => {
      // 1. No existe hash previo
      fileInfoRepoMock.getOneByHash.mockResolvedValueOnce(null);
      // 2. No hay archivos previos (para simplificar la lógica de mover)
      fileInfoRepoMock.getAllByMusicId.mockResolvedValueOnce([]);
      // 3. Mock del upsert
      fileInfoRepoMock.upsertOneByPathAndGet.mockResolvedValueOnce(mockFileInfoEntity);

      const ret = await service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithMusicId,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      expect(fileInfoRepoMock.upsertOneByPathAndGet).toHaveBeenCalled();
      // Verifica que devuelve el fileInfo
      expect(ret.data.fileInfo).toEqual(mockFileInfoEntity);
    } );

    it("debería mover el archivo a la carpeta correcta si ya existen otros archivos", async () => {
      fileInfoRepoMock.getOneByHash.mockResolvedValueOnce(null);
      // Simulamos que ya hay un archivo en "artist/album/old.mp3"
      const previousFile = {
        ...mockFileInfoEntity,
        path: "artist/album/old.mp3",
      };

      fileInfoRepoMock.getAllByMusicId.mockResolvedValueOnce([previousFile]);
      fileInfoRepoMock.upsertOneByPathAndGet.mockResolvedValueOnce(mockFileInfoEntity);

      await service.upload( {
        file: mockFile,
        uploadDto: uploadDtoWithMusicId,
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      // Debería intentar renombrar/mover el archivo nuevo a la carpeta del viejo
      expect(fs.promises.rename).toHaveBeenCalled();
    } );
  } );

  describe("subida creando Nueva Música (sin musicId)", () => {
    it("debería crear una música desde el path del archivo", async () => {
      fileInfoRepoMock.getOneByHash.mockResolvedValueOnce(null);
      // Mock de createOneFromPath
      musicRepoMock.createOneFromPath.mockResolvedValueOnce( {
        music: mockMusicEntity,
        fileInfo: mockFileInfoEntity,
      } );

      const ret = await service.upload( {
        file: mockFile,
        uploadDto: uploadDtoNewMusic, // Sin musicId
        uploaderUserId: fixtureUsers.Admin.User.id,
      } );

      expect(musicRepoMock.createOneFromPath).toHaveBeenCalled();
      expect(ret.data.music).toBeDefined();
      expect(ret.data.music?.id).toBe(mockMusicEntity.id);
    } );
  } );
} );
