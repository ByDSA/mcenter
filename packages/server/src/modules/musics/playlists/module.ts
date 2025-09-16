import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { MusicsCrudModule } from "../crud/module";
import { MusicHistoryModule } from "../history/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicPlaylistsController } from "./crud/controller";
import { MusicPlaylistsRepository } from "./crud/repository/repository";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicHistoryModule,
    ResourceResponseFormatterModule,
    MusicRendererModule,
  ],
  controllers: [
    MusicPlaylistsController,
  ],
  providers: [
    MusicPlaylistsRepository,
  ],
  exports: [],
} )
export class MusicPlaylistsModule {}
