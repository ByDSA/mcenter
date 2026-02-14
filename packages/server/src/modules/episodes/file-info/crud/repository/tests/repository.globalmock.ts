import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { EpisodeFileInfosRepository } from "../repository";

const SAMPLE_EPISODE_FILE_INFO = {
  id: new Types.ObjectId().toString(),
  path: "/path/to/video.mp4",
  hash: "abc123def456",
  size: 1024,
  mediaInfo: {
    duration: 3600,
    resolution: {
      width: 1920,
      height: 1080,
    },
    fps: "30",
  },
  timestamps: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  episodeId: new Types.ObjectId().toString(),
} satisfies EpisodeFileInfoEntity;

class EpisodeFileInfosRepositoryMock extends createMockClass(EpisodeFileInfosRepository) {
  constructor() {
    super();

    this.createOneAndGet.mockImplementation((model) => Promise.resolve( {
      ...model,
      id: new Types.ObjectId().toString(),
    } ));

    this.updateOneByEpisodeId.mockResolvedValue(undefined);

    this.getAll.mockResolvedValue([SAMPLE_EPISODE_FILE_INFO]);

    this.getAllByEpisodeId.mockResolvedValue([SAMPLE_EPISODE_FILE_INFO]);

    this.getOneByHash.mockResolvedValue(SAMPLE_EPISODE_FILE_INFO);

    this.getManyByHash.mockResolvedValue([SAMPLE_EPISODE_FILE_INFO]);

    this.getOneByPath.mockResolvedValue(SAMPLE_EPISODE_FILE_INFO);

    this.patchOneByPathAndGet.mockResolvedValue(SAMPLE_EPISODE_FILE_INFO);

    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE_EPISODE_FILE_INFO);
  }
}

registerMockProviderInstance(EpisodeFileInfosRepository, new EpisodeFileInfosRepositoryMock());
