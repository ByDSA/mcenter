import { Controller, Get } from "@nestjs/common";
import { FullResponse, LogElementResponse } from "$shared/utils/http";
import { SerieRepository } from "#modules/series";
import { StreamsRepository } from "#modules/streams/repositories";

@Controller("/fixer")
export class FixerController {
  constructor(
    private serieRepository: SerieRepository,
    private streamRepository: StreamsRepository,
  ) {
  }

  @Get("/")
  async endpoint() {
    const actions: LogElementResponse[] = [];

    actions.push(...await this.fixSeries());

    const responseElement: FullResponse<LogElementResponse[]> = {
      data: actions,
    };

    return responseElement;
  }

  async fixSeries(): Promise<LogElementResponse[]> {
    const actions: LogElementResponse[] = [];
    const series = await this.serieRepository.getAll();
    const promises: Promise<LogElementResponse | null>[] = [];

    for (const serie of series) {
      const promise = this.streamRepository.fixDefaultStreamForSerie(serie.id);

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
