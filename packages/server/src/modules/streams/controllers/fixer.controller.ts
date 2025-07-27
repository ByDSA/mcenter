import { Controller, Get } from "@nestjs/common";
import { DataResponse, errorToErrorElementResponse } from "$shared/utils/http";
import { SerieRepository } from "#modules/series/repositories";
import { StreamsRepository } from "#modules/streams/repositories";

@Controller("/fixer")
export class FixerController {
  constructor(
    private readonly serieRepository: SerieRepository,
    private readonly streamRepository: StreamsRepository,
  ) {
  }

  @Get("/")
  async endpoint() {
    return await this.createAllDefaultForSerieIfNeeded();
  }

  async createAllDefaultForSerieIfNeeded(): Promise<DataResponse<string[]>> {
    const response: DataResponse<string[]> = {
      data: [],
      errors: [],
    };
    const series = await this.serieRepository.getAll();
    const promises: Promise<string | null | void>[] = [];

    for (const serie of series) {
      const promise = this.streamRepository.createDefaultForSerieIfNeeded(serie.key)
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
