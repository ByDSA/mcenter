import { Body, Controller, Get, Param, Req, Res } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Request, Response } from "express";
import { getHostFromRequest } from "$shared/models/resources";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { GetMany } from "#utils/nestjs/rest/crud/get";
import { PatchOne } from "#utils/nestjs/rest";
import { assertFoundClient } from "#utils/validation/found";
import { ResponseFormat, ResponseFormatterService } from "#modules/resources/response-formatter";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { EpisodesRepository } from "../crud/repository";
import { EpisodeSlugHandlerService } from "./service";

class GetOneByIdParamsDto extends createZodDto(EpisodesCrudDtos.GetOne.ById.paramsSchema) {}
class GetAllParamsDto extends createZodDto(EpisodesCrudDtos.GetAll.paramsSchema) {}
class PatchOneByIdParamsDto extends createZodDto(EpisodesCrudDtos.PatchOneById.paramsSchema) {}
class PatchOneByIdBodyDto extends createZodDto(EpisodesCrudDtos.PatchOneById.bodySchema) {}

const schema = episodeEntitySchema;

@Controller()
export class EpisodesSlugController {
  constructor(
    private readonly slugHandler: EpisodeSlugHandlerService,
    private readonly episodesRepo: EpisodesRepository,
    private readonly responseFormatter: ResponseFormatterService,
  ) {
  }

  @PatchOne("/:seriesKey/:episodeKey", schema)
  async patchOneByIdAndGet(
    @Param() params: PatchOneByIdParamsDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeEntity> {
    const episodePartial = body;
    const compKey = params;
    const got = await this.episodesRepo.patchOneByCompKeyAndGet(compKey, episodePartial);

    assertFoundClient(got);

    return got;
  }

  @GetMany("/:seriesKey", schema)
  async getAll(
    @Param() params: GetAllParamsDto,
  ) {
    const { seriesKey } = params;

    return await this.episodesRepo.getAllBySeriesKey(seriesKey);
  }

  @Get("/:seriesKey/:episodeKey")
  async getOneBySlug(
    @Param() params: GetOneByIdParamsDto,
    @Res( {
      passthrough: true,
    } ) res: Response,
    @Req() req: Request,
  ) {
    const format = this.responseFormatter.getResponseFormatByRequest(req);
    let got: EpisodeEntity | null;

    if (format === ResponseFormat.M3U8 || format === ResponseFormat.JSON) {
      const criteria: Parameters<
        typeof this.episodesRepo.getOneByCompKey
      >[1] = format === ResponseFormat.M3U8
        ? {
          expand: ["fileInfos"],
        }
        : {
          expand: [],
        };

      criteria.expand?.push("series");

      got = await this.episodesRepo.getOneByCompKey(params, criteria);

      assertFoundClient(got);
    }

    switch (format) {
      case ResponseFormat.M3U8:
        return this.responseFormatter.formatOneRemoteM3u8Response(
          got!,
          getHostFromRequest(req),
        );
      case ResponseFormat.RAW:
        return await this.slugHandler.handle(params, req, res);
      case ResponseFormat.JSON:
      {
        validateResponseWithZodSchema(got!, schema, req);
        const json = this.responseFormatter.formatOneJsonResponse(got!, res);

        return json;
      }
    }
  }
}
