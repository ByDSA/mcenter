import { SERIES_SAMPLE_SERIES } from "$shared/models/episodes/series/tests/fixtures";
import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { SeriesRepository } from "../repository";

class SeriesRepositoryMock extends createMockClass(SeriesRepository) {
  constructor() {
    super();

    this.getOneByKey.mockResolvedValue(SERIES_SAMPLE_SERIES);
    this.getOneById.mockResolvedValue(SERIES_SAMPLE_SERIES);
    this.getOneOrCreate.mockResolvedValue(SERIES_SAMPLE_SERIES);
  }
}

export function createAndRegisterSeriesRepositoryMockClass() {
  registerMockProviderInstance(SeriesRepository, new SeriesRepositoryMock());
}
