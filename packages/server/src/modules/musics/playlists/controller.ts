import path from "node:path";
import { createReadStream } from "node:fs";
import { Controller, Get, Param, StreamableFile } from "@nestjs/common";
import { ENVS } from "../utils";

@Controller("/")
export class MusicGetPlaylistsController {
  constructor() {
  }

  @Get("/:name")
  getPlaylist(@Param() params: any) {
    const { name } = params;
    const playlistsFolder = path.join(ENVS.mediaPath, "music", "playlists");
    const filePath = path.join(playlistsFolder, name);
    const file = createReadStream(filePath);

    return new StreamableFile(file);
  }
}
