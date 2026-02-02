import { Body, Controller } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { UserPatchOne } from "#utils/nestjs/rest";
import { UsersMusicPlaylistsRepository } from "#musics/users-playlists/repository";
import { Authenticated } from "../../../core/auth/users/Authenticated.guard";
import { userEntitySchema, UserPayload } from "../../../core/auth/users/models";
import { User } from "../../../core/auth/users/User.decorator";

class MusicPlaylistFavoriteDto extends createZodDto(z.object( {
  playlistId: mongoDbId.nullable(),
} )) {}

@Authenticated()
@Controller()
export class UsersMusicController {
  constructor(
    private readonly usersMusicPlaylistsRepo: UsersMusicPlaylistsRepository,
  ) { }

  @UserPatchOne(userEntitySchema, {
    url: "/musics/favorite-playlist",
  } )
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
