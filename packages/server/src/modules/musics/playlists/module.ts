import { Module } from "@nestjs/common";
import { MusicGetPlaylistsController } from "./controller";

@Module( {
  imports: [
  ],
  controllers: [
    MusicGetPlaylistsController,
  ],
  providers: [
  ],
  exports: [],
} )
export class MusicsGetPlaylistsModule {}
