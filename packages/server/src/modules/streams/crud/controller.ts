import { Request, Response } from "express";
import { Body, Controller } from "@nestjs/common";
import { StreamCrudDtos } from "$shared/models/streams/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Stream, streamEntitySchema } from "#modules/streams/models";
import { CanGetAll } from "#utils/layers/controller";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/crud/get";
import { StreamsRepository } from "./repository";

const schema = streamEntitySchema;

class CriteriaBodyDto extends createZodDto(StreamCrudDtos.GetManyByCriteria.criteriaSchema) {}

@Controller()
export class StreamsCrudController
implements
    CanGetAll<Request, Response> {
  constructor(
    private readonly streamRepository: StreamsRepository,
  ) {
  }

  @GetMany("/", schema)
  async getAll() {
    return await this.streamRepository.getAll();
  }

  @GetManyCriteria("/criteria", schema)
  async getMany(
    @Body() body: CriteriaBodyDto,
  ): Promise<Stream[]> {
    return await this.streamRepository.getManyByCriteria(body);
  }
}
