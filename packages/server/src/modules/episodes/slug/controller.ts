import { Body, Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Request, Response } from "express";
import { getHostFromRequest } from "$shared/models/resources";
import { UserPayload } from "$shared/models/auth";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { GetAll } from "#utils/nestjs/rest/crud/get";
import { AdminPatchOne } from "#utils/nestjs/rest";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { ResponseFormat, EpisodeResponseFormatterService } from "#modules/resources/response-formatter";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { User } from "#core/auth/users/User.decorator";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodeSlugHandlerService } from "./service";

class GetOneByCompKeyParamsDto extends createZodDto(
  EpisodesCrudDtos.GetOne.ByCompKey.paramsSchema,
) {}
class GetAllParamsDto extends createZodDto(EpisodesCrudDtos.GetAll.paramsSchema) {}
class PatchOneByCompKeyParamsDto extends createZodDto(EpisodesCrudDtos.Patch.compKeyParamsSchema) {}
class PatchOneByIdBodyDto extends createZodDto(EpisodesCrudDtos.Patch.bodySchema) {}

const schema = episodeEntitySchema;

@Controller()
export class EpisodesSlugController {
  constructor(
    private readonly slugHandler: EpisodeSlugHandlerService,
    private readonly episodesRepo: EpisodesRepository,
    private readonly responseFormatter: EpisodeResponseFormatterService,
    private readonly episodeUserInfosRepo: EpisodesUsersRepository,
  ) {
  }

  @AdminPatchOne(schema, {
    url: "/:seriesKey/:episodeKey",
  } )
  async patchOneByCompKeyAndGet(
    @Param() params: PatchOneByCompKeyParamsDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeEntity> {
    const episodePartial = body;
    const compKey = params;
    const got = await this.episodesRepo.patchOneByCompKeyAndGet(compKey, episodePartial);

    assertFoundClient(got);

    return got;
  }

  @GetAll(schema, {
    url: "/:seriesKey",
  } )
  async getAll(
    @Param() params: GetAllParamsDto,
  ) {
    const { seriesKey } = params;

    return await this.episodesRepo.getAllBySeriesKey(seriesKey);
  }

  @Get("/:seriesKey/:episodeKey")
  async getOneBySlug(
    @Param() params: GetOneByCompKeyParamsDto,
    @Res( {
      passthrough: true,
    } ) res: Response,
    @Req() req: Request,
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
  ) {
    mongoDbId.or(z.undefined()).parse(token);
    const userId = user?.id ?? token ?? null;
    const format = this.responseFormatter.getResponseFormatByRequest(req);
    let got: EpisodeEntity | null;

    if (format === ResponseFormat.M3U8 || format === ResponseFormat.JSON) {
      const criteria: Parameters<
        typeof this.episodesRepo.getOneById
      >[1] = format === ResponseFormat.M3U8
        ? {
          expand: ["fileInfos"],
        }
        : {
          expand: [],
        };

      criteria.expand?.push("series");

      got = await this.episodesRepo.getOneByEpisodeKeyAndSerieId(
        params.seriesKey,
        params.episodeKey,
        criteria,
        {
          requestingUserId: userId ?? undefined,
        },
      );

      assertFoundClient(got);
    }

    switch (format) {
      case ResponseFormat.M3U8: {
        assertFoundServer(got!.series);

        return this.responseFormatter.formatOneRemoteM3u8Response(
          got!,
          got!.series.key,
          getHostFromRequest(req),
        );
      }
      case ResponseFormat.RAW: {
        return await this.slugHandler.handle( {
          slug: params,
          req,
          res,
          userId: userId ?? undefined,
        } );
      }
      case ResponseFormat.JSON:
      {
        if (userId) {
          const userInfo = await this.episodeUserInfosRepo.getOneById( {
            episodeId: got!.id,
            userId,
          } );

          if (userInfo)
            got!.userInfo = userInfo;
        }

        validateResponseWithZodSchema(got!, schema, req);
        const json = this.responseFormatter.formatOneJsonResponse(got!, res);

        return json;
      }
    }
  }
}
