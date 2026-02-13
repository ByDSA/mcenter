/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { fixtureEpisodes } from "#episodes/tests";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { EpisodesRepository } from "..";

const SAMPLE = fixtureEpisodes.SampleSeries.Samples.EP1x01;

class MockEpisodesRepository extends createMockClass(EpisodesRepository) {
  constructor() {
    super();

    this.getOneById.mockImplementation(async id => {
      return fixtureEpisodes.Simpsons.List.find(e=>e.id === id) ?? null;
    } );

    this.getOneById.mockResolvedValue(SAMPLE);
    this.createOneAndGet.mockResolvedValue(SAMPLE);
    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE);
    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE);
    this.getOneBySlug.mockResolvedValue(SAMPLE);
  }
}

registerMockProviderInstance(EpisodesRepository, new MockEpisodesRepository());
