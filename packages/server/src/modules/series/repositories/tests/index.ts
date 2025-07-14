import { createMockClass } from "#tests/jest/mocking";
import { SerieRepository } from "../Repository";

class SerieRepositoryMock extends createMockClass(SerieRepository) { }

export const serieRepositoryMockProvider = {
  provide: SerieRepository,
  useClass: SerieRepositoryMock,
};
