import { createMockClass } from "#tests/jest/mocking";
import { SerieRepository } from "../repository";

class SerieRepositoryMock extends createMockClass(SerieRepository) { }

export const serieRepositoryMockProvider = {
  provide: SerieRepository,
  useClass: SerieRepositoryMock,
};
