import { Controller, Get } from "@nestjs/common";
import { ResultResponse, errorToErrorElementResponse } from "$shared/utils/http/responses";
import { SeriesRepository } from "#modules/series/crud/repository";
import { StreamsRepository } from "#modules/streams/crud/repository";

@Controller("/fixer")
export class FixerController {
  constructor(
    private readonly seriesRepo: SeriesRepository,
    private readonly streamsRepo: StreamsRepository,
  ) {
  }

  @Get("/")
  async endpoint() {
    return await this.createAllDefaultForSerieIfNeeded();
  }

  async createAllDefaultForSerieIfNeeded(): Promise<ResultResponse<string[]>> {
    const response: ResultResponse<string[]> = {
      data: [],
      errors: [],
    };
    const series = await this.seriesRepo.getAll();
    const promises: Promise<string | null | void>[] = [];

    for (const serie of series) {
      const promise = this.streamsRepo.createDefaultForSerieIfNeeded(serie.key)
        .then(stream => {
          if (!stream)
            return null;

          return `Created default stream for serie ${stream.key}`;
        } )
        .catch(e=> {
          response.errors?.push(errorToErrorElementResponse(e));
        } );

      promises.push(promise);
    }

    response.data = (await Promise.all(promises)).filter(Boolean) as string[];

    return response;
  }
}
