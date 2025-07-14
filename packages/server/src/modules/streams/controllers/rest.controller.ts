import { Request, Response } from "express";
import { Body, Controller, Get } from "@nestjs/common";
import { CriteriaSortDir } from "$shared/utils/criteria";
import { CriteriaSort, getManyByCriteria } from "$shared/models/streams/dto/rest";
import { createZodDto } from "nestjs-zod";
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { Stream, StreamOriginType, streamSchema } from "#modules/streams/models";
import { CanGetAll } from "#utils/layers/controller";
import { GetManyCriteria } from "#utils/nestjs/rest/Get";
import { StreamsRepository } from "../repositories";

class CriteriaBodyDto extends createZodDto(getManyByCriteria.reqBodySchema) {}

@Controller()
export class StreamsRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private streamRepository: StreamsRepository,
    private serieRepository: SerieRepository,
    private historyListRepository: HistoryListRepository,
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
            origin.serie = await this.serieRepository.getOneById(origin.id) ?? undefined;
          }
        }
      }
    }

    if (body.sort) {
      if (body.sort[CriteriaSort.lastTimePlayed]) {
        const lastTimePlayedDic: {[key: string]: number | undefined} = {};

        for (const stream of got) {
          const serieId = stream.group.origins[0]?.id;

          if (!serieId)

            continue;

          const historyList = await this.historyListRepository.getOneByIdOrCreate(stream.id);
          const lastEntry = historyList?.entries.at(-1);

          if (lastEntry)
            lastTimePlayedDic[serieId] = lastEntry.date.timestamp;
        }

        // cambiar por toSorted en node 20
        got = got.sort((a, b) => {
          const serieIdA = a.group.origins[0]?.id;
          const serieIdB = b.group.origins[0]?.id;

          if (!serieIdA || !serieIdB)
            return -1;

          const lastTimePlayedA = lastTimePlayedDic[serieIdA] ?? 0;
          const lastTimePlayedB = lastTimePlayedDic[serieIdB] ?? 0;

          if (body.sort?.lastTimePlayed === CriteriaSortDir.ASC)
            return lastTimePlayedA - lastTimePlayedB;

          return lastTimePlayedB - lastTimePlayedA;
        } );
      }
    }

    return got;
  }
}
