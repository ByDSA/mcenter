import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { StreamEntity, StreamMode, StreamOriginType } from "$shared/models/episodes/streams/stream";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { StreamsRepository } from "../repository";

const SAMPLE_STREAM = {
  id: new Types.ObjectId().toString(),
  key: "sample-key",
  group: {
    origins: [
      {
        type: StreamOriginType.SERIE,
        id: "sample-series-id",
      },
    ],
  },
  mode: StreamMode.SEQUENTIAL,
  userId: new Types.ObjectId().toString(),
} satisfies StreamEntity;

class StreamsRepositoryMock extends createMockClass(StreamsRepository) {
  constructor() {
    super();

    this.getManyByCriteria.mockResolvedValue([SAMPLE_STREAM]);

    this.createOneAndGet.mockImplementation((stream) => Promise.resolve( {
      ...stream,
      id: new Types.ObjectId().toString(),
    } ));

    this.getOneById.mockResolvedValue(SAMPLE_STREAM);

    this.getAll.mockResolvedValue([SAMPLE_STREAM]);

    this.getOneByKey.mockResolvedValue(SAMPLE_STREAM);

    this.getOneOrCreateBySeriesId.mockResolvedValue(SAMPLE_STREAM);

    this.hasDefaultForSerie.mockResolvedValue(true);

    this.createDefaultForSerieIfNeeded.mockResolvedValue(SAMPLE_STREAM);
  }
}

registerMockProviderInstance(StreamsRepository, new StreamsRepositoryMock());
