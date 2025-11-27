import { Module, forwardRef } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { UsersModule } from "#core/auth/users";
import { MusicsCrudModule } from "../crud/module";
import { MusicHistoryModule } from "../history/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicPlaylistsController } from "./crud/controller";
import { MusicPlaylistsRepository } from "./crud/repository/repository";
import { MusicPlaylistAvailableSlugGeneratorService } from "./crud/repository/available-slug-generator.service";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicHistoryModule,
    ResourceResponseFormatterModule,
    MusicRendererModule,
    forwardRef(()=>UsersModule),
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
