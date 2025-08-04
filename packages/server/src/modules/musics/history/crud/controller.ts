import { Request, Response } from "express";
import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/crud/get";
import { musicHistoryEntryEntitySchema } from "../models";
import { MusicHistoryRepository } from "./repository";

class GetManyByCriteriaBodyDto
  extends createZodDto(MusicHistoryEntryCrudDtos.GetManyByCriteria.bodySchema) {}
class DeleteOneByIdParamsDto
  extends createZodDto(MusicHistoryEntryCrudDtos.DeleteOneById.paramsSchema) {}

const schema = musicHistoryEntryEntitySchema;

@Controller()
export class MusicHistoryCrudController implements CanGetAll<Request, Response> {
  constructor(
    private readonly historyRepo: MusicHistoryRepository,
  ) {}

  @GetMany("/", schema)
  getAll() {
    return this.historyRepo.getAll();
  }

  @DeleteOne("/:id", schema)
  async deleteOneByIdAndGet(
    @Param() params: DeleteOneByIdParamsDto,
  ) {
    const { id } = params;
    const deleted = await this.historyRepo.deleteOneByIdAndGet(id);

    return deleted;
  }

  @GetManyCriteria("/search", schema)
  async getManyEntriesBySearch(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    return await this.historyRepo.getManyByCriteria(body);
  }
}
