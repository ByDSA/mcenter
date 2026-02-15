/* eslint-disable require-await */
import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { fixtureEpisodes } from "#episodes/tests";
import { SeriesRepository } from "../repository";

const SERIES_SAMPLE_SERIES = fixtureEpisodes.Series.Samples.SampleSeries;
const ALL_SERIES = fixtureEpisodes.Series.List;

class SeriesRepositoryMock extends createMockClass(SeriesRepository) {
  constructor() {
    super();

    this.getOneByKey.mockImplementation(
      async key=>{
        const res = ALL_SERIES.find(s=>s.key === key);

        if (!res)
          return null;

        return res;
      },
    );
    this.getOneById.mockImplementation(
      async id=>{
        const res = ALL_SERIES.find(s=>s.id === id);

        if (!res)
          return null;

        return res;
      },
    );
    this.patchOneByIdAndGet.mockResolvedValue(SERIES_SAMPLE_SERIES);
    this.deleteOneByIdAndGet.mockResolvedValue(SERIES_SAMPLE_SERIES);
    this.getOneOrCreate.mockResolvedValue(SERIES_SAMPLE_SERIES);
    this.createOneAndGet.mockResolvedValue(SERIES_SAMPLE_SERIES);
    this.getAll.mockResolvedValue(ALL_SERIES);
    this.getMany.mockResolvedValue( {
      data: [SERIES_SAMPLE_SERIES],
      metadata: {
        totalCount: 1,
      },
    } );
  }
}

registerMockProviderInstance(SeriesRepository, new SeriesRepositoryMock());
