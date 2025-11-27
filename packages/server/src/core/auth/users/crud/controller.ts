import { Body, Controller } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { UserPatchOne } from "#utils/nestjs/rest";
import { UsersMusicPlaylistsRepository } from "#musics/users-playlists/repository";
import { Authenticated } from "../Authenticated.guard";
import { userEntitySchema, UserPayload } from "../models";
import { User } from "../User.decorator";
import { UsersRepository } from "./repository";

class MusicPlaylistFavoriteDto extends createZodDto(z.object( {
  playlistId: mongoDbId.nullable(),
} )) {}

@Authenticated()
@Controller()
export class UsersController {
  constructor(
    private readonly repo: UsersRepository,
    private readonly usersMusicPlaylistsRepo: UsersMusicPlaylistsRepository,
  ) { }

  @UserPatchOne("/musics/favorite-playlist", userEntitySchema)
  async musicPlaylistFavorite(
    @User() user: UserPayload,
    @Body() body: MusicPlaylistFavoriteDto,
  ) {
    const got = await this.usersMusicPlaylistsRepo.setMusicPlaylistFavorite(
      user.id,
      body.playlistId,
    );

    return got;
  }
}
