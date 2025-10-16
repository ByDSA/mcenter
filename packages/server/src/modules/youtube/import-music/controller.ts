import { YoutubeCrudDtos } from "$shared/models/youtube/dto/transport";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { User } from "#core/auth/users/User.decorator";
import { YoutubeImportMusicOneTaskHandler } from "./import-one.handler";
import { YoutubeImportMusicPlaylistTaskHandler } from "./import-playlist.handler";

@IsAdmin() // TODO: cambiar a uploader cuando exista el rol
@Controller()
export class YoutubeImportMusicController {
  constructor(
    private readonly importOneTaskHandler: YoutubeImportMusicOneTaskHandler,
    private readonly importPlaylistTaskHandler: YoutubeImportMusicPlaylistTaskHandler,
  ) {}

  @Get("one/:id")
  @TaskCreatedResponseValidation(YoutubeCrudDtos.ImportOne.CreateTask.payloadSchema)
  async createImportOneTask(
    @Param("id") id: string,
    @Query("musicId") musicId: string | undefined,
    @User() user: UserPayload,
  ) {
    const job = await this.importOneTaskHandler.addTask( {
      id,
      musicId,
      uploaderUserId: user.id,
    } );

    return {
      job,
    };
  }

  @Get("playlist/:id")
  @TaskCreatedResponseValidation(YoutubeCrudDtos.ImportPlaylist.CreateTask.payloadSchema)
  async createImportPlaylistTask(
    @Param("id") id: string,
    @User() user: UserPayload,
  ) {
    const job = await this.importPlaylistTaskHandler.addTask( {
      id,
      uploaderUserId: user.id,
    } );

    return {
      job,
    };
  }
}
