import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { UserPayload } from "$shared/models/auth";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { QueryDto } from "../play-stream/controller";
import { AuthPlayerService } from "../AuthPlayer.service";
import { SecretTokenBodyDto } from "../model";
import { PlayMusicService } from "./service";

class ParamsDto extends createZodDto(z.object( {
  remotePlayerId: mongoDbId,
  slug: z.string(),
} )) {}

@Controller("play/:remotePlayerId/music")
export class PlayMusicController {
  constructor(
    private readonly playService: PlayMusicService,
    private readonly auth: AuthPlayerService,
  ) { }

  @Get("/:slug")
  @Authenticated()
  async playMusic(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
    @User() user: UserPayload,
  ) {
    await this.auth.guardUser( {
      userId: user.id,
      remotePlayerId: params.remotePlayerId,
    } );

    return await this.playService.playMusic(params.remotePlayerId, params.slug, query);
  }

  @Post("/:slug")
  @HttpCode(HttpStatus.ACCEPTED)
  async playMusicWithToken(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
    @Body() body: SecretTokenBodyDto,
  ) {
    try {
      await this.auth.guardToken( {
        remotePlayerId: params.remotePlayerId,
        secretToken: body.secretToken,
      } );

      return await this.playService.playMusic(params.remotePlayerId, params.slug, query);
    } catch { /* empty */ }
  }
}
