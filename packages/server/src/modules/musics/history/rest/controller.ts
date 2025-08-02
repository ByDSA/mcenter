import { Request, Response } from "express";
import { Body, Controller, forwardRef, Inject, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicHistoryEntryRestDtos } from "$shared/models/musics/history/dto/transport";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/Get";
import { musicHistoryEntryEntitySchema } from "../models";
import { MusicHistoryRepository } from "./repository";

class GetManyByCriteriaBodyDto
  extends createZodDto(MusicHistoryEntryRestDtos.GetManyByCriteria.bodySchema) {}
class DeleteOneByIdParamsDto
  extends createZodDto(MusicHistoryEntryRestDtos.DeleteOneById.paramsSchema) {}

const schema = musicHistoryEntryEntitySchema;

@Controller()
export class MusicHistoryRestController implements CanGetAll<Request, Response> {
  constructor(
    @Inject(forwardRef(()=>MusicHistoryRepository))
    private readonly historyRepository: MusicHistoryRepository,
  ) {}

  @GetMany("/", schema)
  getAll() {
    return this.historyRepository.getAll();
  }

  @DeleteOne("/:id", schema)
  async deleteOneByIdAndGet(
    @Param() params: DeleteOneByIdParamsDto,
  ) {
    const { id } = params;
    const deleted = await this.historyRepository.deleteOneByIdAndGet(id);

    return deleted;
  }

  @GetManyCriteria("/search", schema)
  async getManyEntriesBySearch(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    return await this.historyRepository.getManyByCriteria(body);
  }
}
