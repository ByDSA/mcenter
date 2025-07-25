import { Controller, Get } from "@nestjs/common";
import { DataResponse, LogElementResponse } from "$shared/utils/http";
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
    const actions: LogElementResponse[] = [];

    actions.push(...await this.fixSeries());

    const responseElement: DataResponse<LogElementResponse[]> = {
      data: actions,
    };

    return responseElement;
  }

  async fixSeries(): Promise<LogElementResponse[]> {
    const actions: LogElementResponse[] = [];
    const series = await this.serieRepository.getAll();
    const promises: Promise<LogElementResponse | null>[] = [];

    for (const serie of series) {
      const promise = this.streamRepository.fixDefaultStreamForSerie(serie.key);

      promises.push(promise);
    }

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result)
        actions.push(result);
    }

    return actions;
  }
}
