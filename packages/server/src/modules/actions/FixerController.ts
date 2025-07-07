import { FullResponse, LogElementResponse } from "#shared/utils/http";
import { Controller, Get } from "@nestjs/common";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams/repositories";

@Controller()
export class FixerController {
  constructor(
    private serieRepository: SerieRepository,
    private streamRepository: StreamRepository,
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
