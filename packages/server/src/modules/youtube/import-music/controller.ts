import { Controller, Get, Param } from "@nestjs/common";
import { YoutubeCrudDtos } from "$shared/models/youtube/dto/transport";
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
  ) {
    const job = await this.importOneTaskHandler.addTask( {
      id,
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
