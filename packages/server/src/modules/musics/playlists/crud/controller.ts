import { Body, Controller, Get, Param, Query, Req, Res, UnprocessableEntityException } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { musicEntitySchema } from "$shared/models/musics";
import { Request, Response } from "express";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { assertIsDefined } from "$shared/utils/validation";
import { UserPayload } from "$shared/models/auth";
import { GetManyCriteria, GetOne, UserDeleteOne, UserPatchOne, UserPostOne } from "#utils/nestjs/rest";
import { ResponseFormat, ResponseFormatterService } from "#modules/resources/response-formatter";
import { assertFoundClient } from "#utils/validation/found";
import { MusicHistoryRepository } from "#musics/history/crud/repository";
import { MusicRendererService } from "#musics/renderer/render.service";
import { User } from "#core/auth/users/User.decorator";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { musicPlaylistEntitySchema, musicPlaylistSchema } from "../models";
import { MusicPlaylistCrudDtos } from "../models/dto";
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
  userId: mongoDbId,
} )) {}
class GetManyUserPlaylistsBody extends createZodDto(
  MusicPlaylistCrudDtos.GetMany.criteriaSchema,
) {}

class AddManyTrackBody extends createZodDto(z.object( {
  musics: z.array(mongoDbId),
  unique: z.boolean().optional(),
} )) {}
class RemoveManyTrackBody extends createZodDto(z.object( {
  tracks: z.array(mongoDbId).optional(),
  musicIds: z.array(mongoDbId).optional(),
} )) {}

class PatchBody extends createZodDto(
  musicPlaylistSchema.pick( {
    name: true,
    slug: true,
  } ).partial()
    .refine(
      data => data.name !== undefined || data.slug !== undefined,
      {
        message: "Debe incluir al menos 'name' o 'slug'.",
      },
    ),
) {}

class CreateOnePlaylistsBody extends createZodDto(
  MusicPlaylistCrudDtos.CreateOne.bodySchema,
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

  @UserPatchOne("/:id", musicPlaylistEntitySchema)
  async patchPlaylist(
    @Param() params: GetOneParams,
    @Body() body: PatchBody,
    @User() user: UserPayload,
  ) {
    await this.guardEditPlaylist(user, params.id);
    const ret = await this.playlistsRepo.patchOneByIdAndGet(params.id, {
      entity: body,
    } );

    return ret;
  }

  @UserPostOne("/", musicPlaylistEntitySchema)
  async createOnePlaylist(
    @Body() body: CreateOnePlaylistsBody,
    @User() user: UserPayload,
  ) {
    const ret = await this.playlistsRepo.createOneAndGet(body, user.id);

    return ret;
  }

  @UserDeleteOne("/:id", musicPlaylistEntitySchema)
  async deleteOnePlaylist(
    @Param() params: GetOneParams,
    @User() user: UserPayload,
  ) {
    await this.guardEditPlaylist(user, params.id);
    const ret = await this.playlistsRepo.deleteOneByIdAndGet(params.id);

    return ret;
  }

  @UserPostOne("/:id/track", musicPlaylistEntitySchema)
  async addTracks(
    @Param() params: GetOneParams,
    @User() user: UserPayload,
    @Body() body: AddManyTrackBody,
  ) {
    const playlistId = params.id;

    await this.guardEditPlaylist(user, playlistId);
    const { musics } = body;

    return await this.playlistsRepo.addManyTracks( {
      id: playlistId,
      musics,
      unique: body.unique,
    } );
  }

  @UserDeleteOne("/:id/track", musicPlaylistEntitySchema)
  async removeManyTracks(
    @Param() params: GetOneParams,
    @User() user: UserPayload,
    @Body() body: RemoveManyTrackBody,
  ) {
    const { tracks, musicIds } = body;

    assertFoundClient(tracks !== undefined || musicIds !== undefined);
    const playlistId = params.id;

    await this.guardEditPlaylist(user, playlistId);
    let ret;

    if (tracks) {
      ret = await this.playlistsRepo.removeManyTracks( {
        id: playlistId,
        tracks,
      } );
    }

    if (musicIds) {
      ret = await this.playlistsRepo.removeManyMusics( {
        id: playlistId,
        musicIds,
      } );
    }

    return ret;
  }

  @Authenticated()
  @GetOne("/:id/track/move/:itemId/:newIndex", musicPlaylistEntitySchema)
  async moveOneTrack(
    @Param() params: MoveOneTrackParams,
    @User() user: UserPayload,
  ) {
    const playlistId = params.id;

    await this.guardEditPlaylist(user, playlistId);
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
    @Param() params: GetManyUserPlaylistsParams,
    @Body() body: GetManyUserPlaylistsBody,
    @User() user: UserPayload | null,
  ) {
    const isSameUserAsRequested = user?.id === params.userId;
    const ret = await this.playlistsRepo.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        userId: params.userId,
      },
    } );

    return ret;
  }

  @GetManyCriteria("/criteria", musicPlaylistEntitySchema)
  async getManyByCriteria(
    @Body() body: GetManyUserPlaylistsBody,
  ) {
    return await this.playlistsRepo.getManyByCriteria(body);
  }

  @Get("/user/:user/:slug")
  async getOneUserPlaylist(
    @Param() params: GetOneUserPlaylistParams,
    @Req() req: Request,
    @User() user: UserPayload | null,
  ) {
    const format = this.responseFormatter.getResponseFormatByRequest(req);

    if (format === ResponseFormat.RAW)
      throw new UnprocessableEntityException("Raw format not supported");

    const playlistCriteria: MusicPlaylistCrudDtos.GetOne.Criteria = {
      expand: ["musics"],
    };

    if (user) {
      playlistCriteria.expand?.push("musicsFavorite");
      playlistCriteria.filter = {
        userId: user.id,
      };
    }

    const playlist = await this.playlistsRepo.getOneBySlug( {
      slug: params.slug,
      userId: params.user,
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
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
  ) {
    mongoDbId.or(z.undefined()).parse(token);
    const format = this.responseFormatter.getResponseFormatByRequest(req);
    const musicCriteria: MusicCrudDtos.GetOne.Criteria = format === ResponseFormat.RAW
      ? {
        expand: ["fileInfos"],
      }
      : {};
    const playlist = await this.playlistsRepo.getOneBySlug( {
      slug: params.slug,
      userId: params.user,
    } );

    assertFoundClient(playlist);
    const got = await this.playlistsRepo.findOneTrackByPosition(
      playlist,
      params.n,
      musicCriteria,
    );

    assertFoundClient(got);

    if (format === ResponseFormat.RAW) {
      const userId = user?.id ?? token;

      if (userId) {
        await this.musicHistoryRepo.createNewEntryNowIfShouldFor( {
          musicId: got.id,
          userId,
        } );
      }
    }

    return this.musicRenderer.render( {
      music: got,
      format,
      request: req,
      response: res,
    } );
  }

  private async guardEditPlaylist(user: UserPayload, playlistId: string) {
    await this.playlistsRepo.guardOwnerPlaylist( {
      userId: user.id,
      playlistId,
    } );
  }
}
