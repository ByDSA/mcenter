import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { MovieEntity } from "$shared/models/movies/movie";
import { fixtureMovies } from "$shared/models/movies/tests/fixtures";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { MovieRepository } from "../repository";

const sample = fixtureMovies.Samples.Inception;

class MockMovieRepository extends createMockClass(MovieRepository) {
  constructor() {
    super();

    this.getOneById.mockResolvedValue(sample);
    this.getAll.mockResolvedValue([sample]);
    this.getManyByCriteria.mockResolvedValue([sample]);
    this.deleteOneByIdAndGet.mockResolvedValue(sample);
    // eslint-disable-next-line require-await
    this.createOneAndGet.mockImplementation(async (data) => ( {
      ...sample,
      ...data,
      id: new Types.ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      addedAt: new Date(),
    } as MovieEntity));
    // eslint-disable-next-line require-await
    this.patchOneByIdAndGet.mockImplementation(async (id, params) => ( {
      ...sample,
      ...params.entity,
      id,
      updatedAt: new Date(),
    } as MovieEntity));
  }
}

registerMockProviderInstance(MovieRepository, new MockMovieRepository());
