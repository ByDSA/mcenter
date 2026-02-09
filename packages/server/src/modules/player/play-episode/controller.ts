import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { UserPayload } from "$shared/models/auth";
import z from "zod";
import { User } from "#core/auth/users/User.decorator";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { assertFoundClient } from "#utils/validation/found";
import { QueryDto } from "../play-stream/controller";
import { AuthPlayerService } from "../AuthPlayer.service";
import { SecretTokenBodyDto } from "../model";
import { PlayEpisodeService } from "./service";

class ParamsDto extends createZodDto(z.object( {
  seriesKey: z.string(),
  episodeKey: z.string(),
  remotePlayerId: mongoDbId,
} )) {}

@Controller("play/:remotePlayerId/episode")
export class PlayEpisodeController {
  constructor(
    private readonly playService: PlayEpisodeService,
    private readonly episodesRepo: EpisodesRepository,
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

    const episode = await this.episodesRepo.getOneBySeriesKeyAndEpisodeKey(
      params.seriesKey,
      params.episodeKey,
    );

    assertFoundClient(episode);

    return await this.playService.playEpisode( {
      remotePlayerId: params.remotePlayerId,
      episodeId: episode.id,
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
      const episode = await this.episodesRepo.getOneBySeriesKeyAndEpisodeKey(
        params.seriesKey,
        params.episodeKey,
      );

      assertFoundClient(episode);

      return await this.playService.playEpisode( {
        remotePlayerId: params.remotePlayerId,
        episodeId: episode.id,
        query,
      } );
    } catch { /* empty */ }
  }
}
