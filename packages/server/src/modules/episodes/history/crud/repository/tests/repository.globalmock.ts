import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { EpisodeHistoryEntryEntity } from "#episodes/history/models";
import { EpisodeHistoryRepository } from "../repository";

const SAMPLE_HISTORY_ENTRY = {
  id: new Types.ObjectId().toString(),
  resourceId: new Types.ObjectId().toString(),
  date: new Date(),
  streamId: new Types.ObjectId().toString(),
  userId: new Types.ObjectId().toString(),
} satisfies EpisodeHistoryEntryEntity;

class EpisodeHistoryRepositoryMock extends createMockClass(EpisodeHistoryRepository) {
  constructor() {
    super();

    this.createOneAndGet.mockImplementation((entry, options) => Promise.resolve( {
      ...entry,
      id: new Types.ObjectId().toString(),
      userId: options.requestingUserId,
    } ));

    this.getAll.mockResolvedValue([SAMPLE_HISTORY_ENTRY]);

    this.getManyBySeriesId.mockResolvedValue([SAMPLE_HISTORY_ENTRY]);

    this.getManyByCriteria.mockResolvedValue([SAMPLE_HISTORY_ENTRY]);

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_HISTORY_ENTRY);

    this.deleteAllAndGet.mockResolvedValue([SAMPLE_HISTORY_ENTRY]);

    this.findLastByEpisodeId.mockResolvedValue(SAMPLE_HISTORY_ENTRY);

    this.findLast.mockResolvedValue(SAMPLE_HISTORY_ENTRY);

    this.isLast.mockResolvedValue(false);

    this.createNewEntryNowFor.mockImplementation((props, options) => Promise.resolve( {
      id: new Types.ObjectId().toString(),
      resourceId: props.episodeId,
      date: new Date(),
      streamId: props.streamId ?? new Types.ObjectId().toString(),
      userId: options.requestingUserId,
    } ));

    this.addEpisodesToHistory.mockResolvedValue(undefined);
  }
}

registerMockProviderInstance(EpisodeHistoryRepository, new EpisodeHistoryRepositoryMock());
