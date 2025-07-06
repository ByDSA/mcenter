/* eslint-disable no-empty-function */
import { Request, Response } from "express";
import { Body, Controller, Header, HttpCode, HttpStatus, Inject, Options, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { assertFound } from "#shared/utils/http";
import { entrySchema } from "#shared/models/musics/history/Entry";
import { getManyEntriesBySearch, deleteOneEntryById } from "#musics/history/models/dto";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/Get";
import { GetManyCriteria as GetManyCriteriaProps } from "../repositories/Repository";
import { MusicHistoryRepository } from "../repositories";

class GetManyEntriesBySearchReqBodyDto
  extends createZodDto(getManyEntriesBySearch.reqBodySchema) {}
class DeleteOneEntryByIdReqParamsDto
  extends createZodDto(deleteOneEntryById.req.paramsSchema) {}

const schema = entrySchema;

@Controller()
export class MusicHistoryRestController implements CanGetAll<Request, Response> {
  constructor(
    @Inject(MusicHistoryRepository) private readonly historyRepository: MusicHistoryRepository,
  ) {}

  @GetMany("/:user", schema)
  getAll() {
    return this.historyRepository.getAll();
  }

  @GetManyCriteria("/:user/search", schema)
  getManyEntriesBySearch(
    @Body() body: GetManyEntriesBySearchReqBodyDto,
  ) {
    const criteria = bodyToCriteria(body);

    return this.historyRepository.getManyCriteria(criteria);
  }

  @DeleteOne("/:user/:id", schema)
  async deleteOneByIdAndGet(
    @Param() params: DeleteOneEntryByIdReqParamsDto,
  ) {
    const { id } = params;
    const deleted = await this.historyRepository.deleteOneByIdAndGet(id);

    assertFound(deleted);

    return deleted;
  }

  @Options("/:user/search")
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Allow-Methods", "POST,DELETE,OPTIONS")
  @Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")
  @HttpCode(HttpStatus.OK)
  async options(): Promise<void> {
  }
}

function bodyToCriteria(body: GetManyEntriesBySearchReqBodyDto): GetManyCriteriaProps {
  const ret: GetManyCriteriaProps = {
    expand: body.expand,
    limit: body.limit,
    offset: body.offset,
  };

  if (body.filter) {
    ret.filter = {};

    if (body.filter.resourceId)
      ret.filter.resourceId = body.filter.resourceId;

    if (body.filter.timestampMax)
      ret.filter.timestampMax = body.filter.timestampMax;
  }

  if (body.sort) {
    if (body.sort.timestamp)
      ret.sort = body.sort.timestamp;
  }

  return ret;
}
