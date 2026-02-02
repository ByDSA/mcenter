import { Controller, Get, Param, Query, UnauthorizedException, UnprocessableEntityException, UseInterceptors } from "@nestjs/common";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { User } from "#core/auth/users/User.decorator";
import { ResponseFormatInterceptor, M3u8FormatUseNext } from "#modules/resources/response-formatter";
import { StreamGetRandomEpisodeService } from "./get-episode.service";

@Controller("/get-episode")
export class StreamGetEpisodeController {
  constructor(
     private readonly service: StreamGetRandomEpisodeService,
  ) { }

  @UseInterceptors(ResponseFormatInterceptor)
  @M3u8FormatUseNext()
  @Get("/:streamKey")
  async getEpisode(
    @Param("streamKey") streamKey: string | undefined,
    @Query("token") token: string | undefined,
    @User() user: UserPayload,
  ) {
    mongoDbId.or(z.undefined()).parse(token);

    if (!streamKey)
      throw new UnprocessableEntityException("Stream Key is required");

    const userId = user?.id ?? token ?? null;

    if (userId === null)
      throw new UnauthorizedException();

    const [episode] = await this.service.getByStreamKey(userId, streamKey, 1);

    return episode;
  }
}
