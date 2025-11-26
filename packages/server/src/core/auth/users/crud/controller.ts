import { Body, Controller } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { Authenticated } from "../Authenticated.guard";
import { userEntitySchema, UserPayload } from "../models";
import { User } from "../User.decorator";
import { UsersRepository } from "./repository";
import { UserPatchOne } from "#utils/nestjs/rest";

class MusicPlaylistFavoriteDto extends createZodDto(z.object( {
  playlistId: mongoDbId.nullable(),
} )) {}

@Authenticated()
@Controller()
export class UsersController {
  constructor(
    private readonly repo: UsersRepository,
  ) { }

  @UserPatchOne("/musics/favorite-playlist", userEntitySchema)
  async musicPlaylistFavorite(
    @User() user: UserPayload,
    @Body() body: MusicPlaylistFavoriteDto,
  ) {
    const got = await this.repo.setMusicPlaylistFavorite(user.id, body.playlistId);

    return got;
  }
}
