/* eslint-disable no-empty-function */
import { assertFound } from "#shared/utils/http/validation";
import { neverCase } from "#shared/utils/validation";
import { z } from "zod";
import { Body, Controller, Header, HttpCode, HttpStatus, Options, Param, Res } from "@nestjs/common";
import { Episode, EpisodeSchema } from "#episodes/models";
import { getAll, getManyBySearch, getOneById, patchOneById } from "#episodes/models/dto";
import { SerieRepository } from "#modules/series";
import { Serie } from "#modules/series/models";
import { ResponseWithBody } from "#utils/validation/zod-express";
import { GetMany, GetManyCriteria, GetOne } from "#utils/nestjs/rest/Get";
import { PatchOne } from "#utils/nestjs/rest";
import { EpisodeRepository } from "../repositories";
import { assertZod } from "#sharedSrc/utils/validation/zod";

type EpisodeGetOneByIdRequest = {
  params: z.infer<typeof getOneById.paramsSchema>;
};

type EpisodeGetAllRequest = {
  params: z.infer<typeof getAll.paramsSchema>;
};

type EpisodePatchOneByIdRequest = {
  params: z.infer<typeof patchOneById.reqParamsSchema>;
  body: z.infer<typeof patchOneById.reqBodySchema>;
};

type EpisodePatchOneByIdResBody = z.infer<typeof patchOneById.resSchema>;

type EpisodeGetManyBySearchRequest = {
  body: z.infer<typeof getManyBySearch.reqBodySchema>;
};

enum ResourceType {
  SERIES = "series",
}

const schema = EpisodeSchema;

@Controller()
export class EpisodesRestController {
  constructor(
    private episodeRepository: EpisodeRepository,
    private serieRepo: SerieRepository,
  ) {
  }

  @PatchOne("/:serieId/:episodeId", {
    get: {
      schema,
    },
  } )
  async patchOneByIdAndGet(
    @Param() params: EpisodePatchOneByIdRequest["params"],
    @Body() body: EpisodePatchOneByIdRequest["body"],
    @Res() res: ResponseWithBody<EpisodePatchOneByIdResBody>,
  ): Promise<void> {
    assertZod(patchOneById.reqParamsSchema, params);
    assertZod(patchOneById.reqBodySchema, body);
    const { episodeId, serieId } = params;
    const episodePartial = body;
    const id = {
      innerId: episodeId,
      serieId,
    };
    const got = await this.episodeRepository.patchOneByIdAndGet(id, episodePartial.entity);

    assertFound(got);
    const ret: EpisodePatchOneByIdResBody = {
      entity: got ?? undefined,
    };

    try {
      assertZod(patchOneById.resSchema, ret);
    } catch {
      res.status(501).send(ret);
    }
    res.send(ret);
  }

  @GetMany("/:serieId", schema)
  async getAll(@Param() params: EpisodeGetAllRequest["params"]) {
    assertZod(getAll.paramsSchema, params);
    const { serieId } = params;

    return await this.episodeRepository.getAllBySerieId(serieId);
  }

  @GetOne("/:serieId/:episodeId", schema)
  async getOneById(
    @Param() params: EpisodeGetOneByIdRequest["params"],
  ) {
    assertZod(getOneById.paramsSchema, params);
    const { episodeId, serieId } = params;
    const id = {
      innerId: episodeId,
      serieId,
    };
    const got = await this.episodeRepository.getOneById(id);

    assertFound(got);

    return got;
  }

  @GetManyCriteria("/search", schema)
  async getManyBySearch(
    @Body() body: EpisodeGetManyBySearchRequest["body"],
  ) {
    assertZod(getManyBySearch.reqBodySchema, body);
    const episodes = [];
    const filterPath = body.filter?.path;

    if (filterPath) {
      const splitted = filterPath.split("/");
      const type: ResourceType = splitted[0] as ResourceType;

      switch (type) {
        case ResourceType.SERIES: {
          const episode: Episode | null = await this.episodeRepository
            .getOneByPath(filterPath);

          if (episode)
            episodes.push(episode);

          break;
        }
        default:
          neverCase(type);
      }
    }

    if (body.expand?.includes(ResourceType.SERIES)) {
      const series: {[serieId: string]: Serie} = {};

      for (const ep of episodes) {
        const { serieId } = ep.id;
        // TODO: quitar await en for
        const serie = series[serieId] ?? await this.serieRepo.getOneById(serieId);

        ep.serie = serie;

        series[serieId] = serie;
      }
    }

    return episodes;
  }

  @Options("/:serieId/:episodeId")
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS")
  @Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")
  @HttpCode(HttpStatus.OK)
  async options(): Promise<void> {
  }
}
