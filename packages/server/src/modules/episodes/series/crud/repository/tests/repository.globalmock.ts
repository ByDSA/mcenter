/* eslint-disable require-await */
import { SERIES_SAMPLE_SERIES, SERIES_SIMPSONS } from "$shared/models/episodes/series/tests/fixtures";
import { createMockClass } from "$sharedTests/jest/mocking";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { SeriesRepository } from "../repository";

const ALL_SERIES = [SERIES_SAMPLE_SERIES, SERIES_SIMPSONS];

class SeriesRepositoryMock extends createMockClass(SeriesRepository) {
  constructor() {
    super();

    this.getOneByKey.mockResolvedValue(SERIES_SAMPLE_SERIES);
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
    this.getAll.mockResolvedValue([SERIES_SAMPLE_SERIES, SERIES_SIMPSONS]);
    this.getMany.mockResolvedValue( {
      data: [SERIES_SAMPLE_SERIES],
      metadata: {
        totalCount: 1,
      },
    } );
  }
}

registerMockProviderInstance(SeriesRepository, new SeriesRepositoryMock());
