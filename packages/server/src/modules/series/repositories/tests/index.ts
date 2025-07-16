import { SerieRepository } from "../Repository";
import { createMockClass } from "#tests/jest/mocking";

class SerieRepositoryMock extends createMockClass(SerieRepository) { }

export const serieRepositoryMockProvider = {
  provide: SerieRepository,
  useClass: SerieRepositoryMock,
};
