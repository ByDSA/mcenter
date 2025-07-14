import { Request, Response } from "express";
import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { deleteOneById } from "$shared/models/musics/history/dto/rest/delete-one-by-id";
import { musicHistoryEntryRestDto } from "$shared/models/musics/history/dto/transport";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/Get";
import { MusicHistoryRepository } from "../repositories";
import { musicHistoryEntrySchema } from "../models";

class GetManyEntriesBySearchReqBodyDto
  extends createZodDto(musicHistoryEntryRestDto.getManyEntriesByCriteria.reqBodySchema) {}
class DeleteOneEntryByIdReqParamsDto
  extends createZodDto(deleteOneById.req.paramsSchema) {}

const schema = musicHistoryEntrySchema;

@Controller()
export class MusicHistoryRestController implements CanGetAll<Request, Response> {
  constructor(
    private readonly historyRepository: MusicHistoryRepository,
  ) {}

  @GetMany("/", schema)
  getAll() {
    return this.historyRepository.getAll();
  }

  @DeleteOne("/:id", schema)
  async deleteOneByIdAndGet(
    @Param() params: DeleteOneEntryByIdReqParamsDto,
  ) {
    const { id } = params;
    const deleted = await this.historyRepository.deleteOneByIdAndGet(id);

    return deleted;
  }

  @GetManyCriteria("/search", schema)
  getManyEntriesBySearch(
    @Body() body: GetManyEntriesBySearchReqBodyDto,
  ) {
    return this.historyRepository.getManyCriteria(body);
  }
}
