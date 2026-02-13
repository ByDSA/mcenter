import { Controller, Get, Query } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { User } from "#core/auth/users/User.decorator";
import { MusicEntity } from "#musics/models";
import { TokenAuth } from "#core/auth/strategies/token/decorator";
import { RenderMusic } from "../renderer/renderer.interceptor";
import { M3u8FormatUseNext } from "../../resources/response-formatter/use-next.decorator";
import { MusicGetRandomService } from "./service";

@Controller()
export class MusicGetRandomController {
  constructor(
    private readonly musicGetRandomService: MusicGetRandomService,
  ) { }

  @RenderMusic( {
    json: true,
    m3u8: true,
  } )
  @M3u8FormatUseNext()
  @TokenAuth()
  @Get("/")
  async getRandom(
    @User() user: UserPayload | null,
    @Query("q") query: string | null = null,
  ): Promise<MusicEntity | null> {
    return await this.musicGetRandomService.getRandom( {
      query,
      userId: user?.id ?? null,
    } );
  }
}
