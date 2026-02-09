import { Body, Controller, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { UserPayload } from "$shared/models/auth";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { episodeEntityWithFileInfosSchema } from "#episodes/models";
import { GetMany } from "#utils/nestjs/rest";
import { PlayEpisodeService } from "../play-episode/service";
import { AuthPlayerService } from "../AuthPlayer.service";
import { SecretTokenBodyDto } from "../model";

class ParamsDto extends createZodDto(z.object( {
  remotePlayerId: mongoDbId,
  streamKey: z.string(),
} )) {}

const booleanFromString = z.preprocess((val) => {
  if (typeof val === "string") {
    const normalized = val.toLowerCase();

    if (normalized === "true" || normalized === "1")
      return true;

    if (normalized === "false" || normalized === "0")
      return false;

    throw new Error(`Invalid boolean string: ${val}. Expected 'true', 'false', '1', or '0'`);
  }

  return val;
}, z.boolean());

export class QueryDto extends createZodDto(z.object( {
  force: booleanFromString.optional(),
  n: z.coerce.number().optional(),
} )) {}

@Controller("play/:remotePlayerId/stream")
export class PlayStreamController {
  constructor(
    private readonly playService: PlayEpisodeService,
    private readonly auth: AuthPlayerService,
  ) { }

  @Authenticated()
  @GetMany("/:streamKey", episodeEntityWithFileInfosSchema)
  async playStreamDefault(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
    @User() user: UserPayload,
  ) {
    await this.auth.guardUser( {
      userId: user.id,
      remotePlayerId: params.remotePlayerId,
    } );

    return await this.playService.playEpisodeStream( {
      userId: user.id,
      remotePlayerId: params.remotePlayerId,
      streamKey: params.streamKey,
      query,
    } );
  }

  @Post("/:streamKey")
  @HttpCode(HttpStatus.ACCEPTED)
  async playStreamWithToken(
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
    @Body() body: SecretTokenBodyDto,
  ) {
    const remotePlayer = await this.auth.guardToken( {
      remotePlayerId: params.remotePlayerId,
      secretToken: body.secretToken,
    } );

    return await this.playService.playEpisodeStream( {
      userId: remotePlayer.ownerId,
      remotePlayerId: params.remotePlayerId,
      streamKey: params.streamKey,
      query,
    } );
  }
}
