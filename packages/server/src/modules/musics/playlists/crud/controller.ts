import { Body, Controller, Get, Param, Req, Res, UnprocessableEntityException } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { musicEntitySchema } from "$shared/models/musics";
import { Request, Response } from "express";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { assertIsDefined } from "$shared/utils/validation";
import { GetManyCriteria, GetOne } from "#utils/nestjs/rest";
import { ResponseFormat, ResponseFormatterService } from "#modules/resources/response-formatter";
import { assertFoundClient } from "#utils/validation/found";
import { MusicHistoryRepository } from "#musics/history/crud/repository";
import { MusicRendererService } from "#musics/renderer/render.service";
import { MusicPlaylistCrudDtos } from "../models/dto";
import { musicPlaylistEntitySchema } from "../models";
import { MusicPlaylistsRepository } from "./repository/repository";

class GetOneParams extends createZodDto(z.object( {
  id: mongoDbId,
} )) {}
const numTrackZeroBasedSchema = z
  .string()
  .transform((val) => {
    const num = Number(val);

    if (!Number.isInteger(num) || num < 0)
      throw new Error("n must be an integer greater or equal than 0");

    return num;
  } );
const numTrackOneBasedSchema = z
  .string()
  .transform((val) => {
    const num = Number(val);

    if (!Number.isInteger(num) || num <= 0)
      throw new Error("n must be an integer greater than 0");

    return num;
  } );
const trackPosParamsSchema = z.object( {
  n: numTrackOneBasedSchema,
} );

class MoveOneTrackParams extends createZodDto(z.object( {
  id: mongoDbId,
  itemId: mongoDbId,
  newIndex: numTrackZeroBasedSchema,
} )) {}
class GetOneTrackParams extends createZodDto(trackPosParamsSchema.extend( {
  id: mongoDbId,
} )) {}
class GetOneUserPlaylistParams extends createZodDto(z.object( {
  user: z.string(),
  slug: z.string(),
} )) {}
class GetOneUserPlaylistTrackParams extends createZodDto(trackPosParamsSchema.extend( {
  user: z.string(),
  slug: z.string(),
} )) {}

class GetManyUserPlaylistsParams extends createZodDto(z.object( {
  userId: z.string(),
} )) {}
class GetManyUserPlaylistsBody extends createZodDto(
  MusicPlaylistCrudDtos.GetMany.criteriaSchema,
) {}

@Controller("/")
export class MusicPlaylistsController {
  constructor(
    private readonly playlistsRepo: MusicPlaylistsRepository,
    private readonly responseFormatter: ResponseFormatterService,
    private readonly musicHistoryRepo: MusicHistoryRepository,
    private readonly musicRenderer: MusicRendererService,
  ) {
  }

  @GetOne("/:id", musicPlaylistEntitySchema)
  async getOne(@Param() params: GetOneParams) {
    return await this.playlistsRepo.getOneById(params.id);
  }

  @GetOne("/:id/track/move/:itemId/:newIndex", musicPlaylistEntitySchema)
  async moveOneTrack(
    @Param() params: MoveOneTrackParams,
  ) {
    const playlist = await this.playlistsRepo.moveMusic(
      params.id,
      params.itemId,
      params.newIndex,
    );

    assertFoundClient(playlist);

    return playlist;
  }

  @GetOne("/:id/track/:n", musicEntitySchema)
  async getOneTrack(@Param() params: GetOneTrackParams) {
    const playlist = await this.playlistsRepo.getOneById(params.id);

    assertFoundClient(playlist);

    return await this.playlistsRepo.findOneTrackByPosition(playlist, params.n);
  }

  @GetManyCriteria("/user/:userId", musicPlaylistEntitySchema)
  async getUserPlaylists(
    @Param() _params: GetManyUserPlaylistsParams,
    @Body() body: GetManyUserPlaylistsBody,
  ) {
    return await this.playlistsRepo.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        // userId: params.userId, // TODO: añadir cuando haya users
      },

    } );
  }

  @GetManyCriteria("/", musicPlaylistEntitySchema)
  async getManyByCriteria(
    @Body() body: GetManyUserPlaylistsBody,
  ) {
    return await this.playlistsRepo.getManyByCriteria(body);
  }

  @Get("/user/:user/:slug")
  async getOneUserPlaylist(
    @Param() params: GetOneUserPlaylistParams,
    @Req() req: Request,
  ) {
    const format = this.responseFormatter.getResponseFormatByRequest(req);

    if (format === ResponseFormat.RAW)
      throw new UnprocessableEntityException("Raw format not supported");

    const playlistCriteria: MusicPlaylistCrudDtos.GetOne.Criteria = {
      expand: ["musics"],
    };
    const playlist = await this.playlistsRepo.getOneBySlug( {
      slug: params.slug,
      user: params.user,
    }, playlistCriteria);

    assertFoundClient(playlist);

    if (format === ResponseFormat.M3U8) {
      assertIsDefined(playlist.list[0].music);

      return this.musicRenderer.renderM3u8Many(playlist.list.map(e=>e.music!), req);
    }

    return createSuccessResultResponse(playlist);
  }

  @Get("/user/:user/:slug/track/:n")
  async getOneUserPlaylistTrack(
    @Param() params: GetOneUserPlaylistTrackParams,
    @Res( {
      passthrough: true,
    } ) res: Response,
    @Req() req: Request,
  ) {
    const format = this.responseFormatter.getResponseFormatByRequest(req);
    const musicCriteria: MusicCrudDtos.GetOne.Criteria = format === ResponseFormat.RAW
      ? {
        expand: ["fileInfos"],
      }
      : {};
    const playlist = await this.playlistsRepo.getOneBySlug( {
      slug: params.slug,
      user: params.user,
    } );

    assertFoundClient(playlist);
    const got = await this.playlistsRepo.findOneTrackByPosition(
      playlist,
      params.n,
      musicCriteria,
    );

    assertFoundClient(got);

    if (format === ResponseFormat.RAW)
      await this.musicHistoryRepo.createNewEntryNowIfShouldFor(got.id);

    return this.musicRenderer.render( {
      music: got,
      format,
      request: req,
      response: res,
    } );
  }
}
