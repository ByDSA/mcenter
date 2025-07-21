import { Request, Response } from "express";
import { Body, Controller, Get } from "@nestjs/common";
import { CriteriaSortDir } from "$shared/utils/criteria";
import { StreamRestDtos } from "$shared/models/streams/dto/transport";
import { createZodDto } from "nestjs-zod";
import { SerieRepository } from "#modules/series/repositories";
import { Stream, StreamOriginType, streamSchema } from "#modules/streams/models";
import { CanGetAll } from "#utils/layers/controller";
import { GetManyCriteria } from "#utils/nestjs/rest/Get";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/repositories";
import { StreamsRepository } from "../repositories";

class CriteriaBodyDto extends createZodDto(StreamRestDtos.GetManyByCriteria.bodySchema) {}

@Controller()
export class StreamsRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private readonly streamRepository: StreamsRepository,
    private readonly serieRepository: SerieRepository,
    private readonly episodeHistoryEntriesRepository: EpisodeHistoryEntriesRepository,
  ) {
  }

  @Get("/")
  async getAll() {
    return await this.streamRepository.getAll();
  }

  @GetManyCriteria("/criteria", streamSchema)
  async getMany(
    @Body() body: CriteriaBodyDto,
  ): Promise<Stream[]> {
    let got = await this.streamRepository.getAll();

    if (body.expand) {
      for (const stream of got) {
        for (const origin of stream.group.origins) {
          if (origin.type === StreamOriginType.SERIE) {
            // TODO: quitar await en for si se puede
            origin.serie = await this.serieRepository.getOneByKey(origin.id) ?? undefined;
          }
        }
      }
    }

    if (body.sort) {
      if (body.sort[StreamRestDtos.GetManyByCriteria.CriteriaSort.lastTimePlayed]) {
        const lastTimePlayedDic: {[key: string]: number | undefined} = {};

        for (const stream of got) {
          const seriesKey = stream.group.origins[0]?.id;

          if (!seriesKey)

            continue;

          const lastEntry = await this.episodeHistoryEntriesRepository
            .findLastForSerieKey(stream.id);

          if (lastEntry)
            lastTimePlayedDic[seriesKey] = lastEntry.date.timestamp;
        }

        got = got.toSorted((a, b) => {
          const seriesKeyA = a.group.origins[0]?.id;
          const seriesKeyB = b.group.origins[0]?.id;

          if (!seriesKeyA || !seriesKeyB)
            return -1;

          const lastTimePlayedA = lastTimePlayedDic[seriesKeyA] ?? 0;
          const lastTimePlayedB = lastTimePlayedDic[seriesKeyB] ?? 0;

          if (body.sort?.lastTimePlayed === CriteriaSortDir.ASC)
            return lastTimePlayedA - lastTimePlayedB;

          return lastTimePlayedB - lastTimePlayedA;
        } );
      }
    }

    return got;
  }
}
