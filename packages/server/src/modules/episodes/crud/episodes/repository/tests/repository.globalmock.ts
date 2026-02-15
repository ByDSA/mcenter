/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { EpisodesRepository } from "..";
import { fixtureEpisodes } from "#episodes/tests";
import { registerMockProviderInstance } from "#utils/nestjs/tests";

const SAMPLE = fixtureEpisodes.SampleSeries.Episodes.Samples.EP1x01;

class MockEpisodesRepository extends createMockClass(EpisodesRepository) {
  constructor() {
    super();

    this.getOneById.mockImplementation(async (id, criteria, options) => {
      const ret = fixtureEpisodes.Episodes.List.find(e=>e.id === id) ?? null;

      if (ret) {
        if (criteria?.expand?.includes("series"))
          ret.series = fixtureEpisodes.Series.List.find(s=>s.id === ret.seriesId);

        if (criteria?.expand?.includes("fileInfos"))
          ret.fileInfos = fixtureEpisodes.FileInfos.List.filter(f=>f.episodeId === ret.id);

        if (
          options?.requestingUserId && criteria?.expand?.includes("userInfo")) {
          ret.userInfo = fixtureEpisodes.UserInfo.List
            .find(u=>u.episodeId === ret.id && u.userId === options.requestingUserId);
        }
      }

      return ret;
    } );

    this.createOneAndGet.mockResolvedValue(SAMPLE);
    this.patchOneByIdAndGet.mockResolvedValue(SAMPLE);
    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE);
    this.getOneBySlug.mockResolvedValue(SAMPLE);
  }
}

registerMockProviderInstance(EpisodesRepository, new MockEpisodesRepository());
