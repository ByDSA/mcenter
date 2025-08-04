import { createMockClass } from "#tests/jest/mocking";
import { SeriesRepository } from "../repository";

class SeriesRepositoryMock extends createMockClass(SeriesRepository) { }

export const seriesRepositoryMockProvider = {
  provide: SeriesRepository,
  useClass: SeriesRepositoryMock,
};
