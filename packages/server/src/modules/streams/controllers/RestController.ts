/* eslint-disable no-empty-function */
import { CriteriaSortDir } from "#shared/utils/criteria";
import { Request, Response } from "express";
import z from "zod";
import { Body, Controller, Get, Header, HttpCode, HttpStatus, Options } from "@nestjs/common";
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamOriginType, streamSchema } from "#modules/streams/models";
import { CriteriaSort, getManyBySearch } from "#modules/streams/models/dto";
import { CanGetAll } from "#utils/layers/controller";
import { GetManyCriteria } from "#utils/nestjs/rest/Get";
import { StreamRepository } from "../repositories";
import { assertZod } from "#sharedSrc/utils/validation/zod";

type StreamGetManyRequest = {
  body: z.infer<typeof getManyBySearch.reqBodySchema>;
};

@Controller()
export class StreamsRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private streamRepository: StreamRepository,
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
    @Body() body: StreamGetManyRequest["body"],
  ) {
    assertZod(getManyBySearch.reqBodySchema, body);
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

  @Options("/")
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Allow-Methods", "GET,OPTIONS")
  @Header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With",
  )
  @HttpCode(HttpStatus.OK)
  optionsRoot(): void {
  }

  @Options("criteria")
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Allow-Methods", "POST,OPTIONS")
  @Header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With",
  )
  @HttpCode(HttpStatus.OK)
  optionsCriteria(): void {
  }
}
