import { YoutubeCrudDtos } from "$shared/models/youtube/dto/transport";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { TaskCreatedResponseValidation } from "#core/tasks";
import { YoutubeImportMusicOneTaskHandler } from "./import-one.handler";
import { YoutubeImportMusicPlaylistTaskHandler } from "./import-playlist.handler";

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
  ) {
    const job = await this.importOneTaskHandler.addTask( {
      id,
      musicId,
    } );

    return {
      job,
    };
  }

  @Get("playlist/:id")
  @TaskCreatedResponseValidation(YoutubeCrudDtos.ImportPlaylist.CreateTask.payloadSchema)
  async createImportPlaylistTask(
    @Param("id") id: string,
  ) {
    const job = await this.importPlaylistTaskHandler.addTask( {
      id,
    } );

    return {
      job,
    };
  }
}
