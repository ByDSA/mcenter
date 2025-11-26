import { Module } from "@nestjs/common";
import { MusicsCrudModule } from "../crud/module";
import { MusicHistoryModule } from "../history/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicPlaylistsController } from "./crud/controller";
import { MusicPlaylistsRepository } from "./crud/repository/repository";
import { MusicPlaylistAvailableSlugGeneratorService } from "./crud/repository/available-slug-generator.service";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";

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
    MusicPlaylistAvailableSlugGeneratorService,
    MusicPlaylistsRepository,
  ],
  exports: [MusicPlaylistsRepository],
} )
export class MusicPlaylistsModule {}
