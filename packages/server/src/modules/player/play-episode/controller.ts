import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { UserPayload } from "$shared/models/auth";
import { EpisodeCompKey, episodeCompKeySchema } from "#episodes/models";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { PlayVideoService } from "../play-video.service";
import { QueryDto } from "../play-stream/controller";
import { AuthPlayerService } from "../AuthPlayer.service";
import { SecretTokenBodyDto } from "../model";

class ParamsDto extends createZodDto(episodeCompKeySchema.extend( {
  remotePlayerId: mongoDbId,
} )) {}

@Controller("play/:remotePlayerId/episode")
export class PlayEpisodeController {
  constructor(
    private readonly playService: PlayVideoService,
    private readonly auth: AuthPlayerService,
  ) {
  }

  @Get("/:seriesKey/:episodeKey")
  @Authenticated()
  async playEpisode(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
    @User() user: UserPayload,
  ) {
    await this.auth.guardUser( {
      userId: user.id,
      remotePlayerId: params.remotePlayerId,
    } );
    const compKey: EpisodeCompKey = {
      episodeKey: params.episodeKey,
      seriesKey: params.seriesKey,
    };

    return await this.playService.playEpisode( {
      remotePlayerId: params.remotePlayerId,
      episodeCompKey: compKey,
      query,
    } );
  }

  @Post("/:seriesKey/:episodeKey")
  @HttpCode(HttpStatus.ACCEPTED)
  async playEpisodeWithToken(
      @Param() params: ParamsDto,
      @Query() query: QueryDto,
      @Body() body: SecretTokenBodyDto,
  ) {
    try {
      await this.auth.guardToken( {
        remotePlayerId: params.remotePlayerId,
        secretToken: body.secretToken,
      } );
      const compKey: EpisodeCompKey = {
        episodeKey: params.episodeKey,
        seriesKey: params.seriesKey,
      };

      return await this.playService.playEpisode( {
        remotePlayerId: params.remotePlayerId,
        episodeCompKey: compKey,
        query,
      } );
    } catch { /* empty */ }
  }
}
