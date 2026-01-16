import { Module, forwardRef } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicPlaylistsModule } from "#musics/playlists/module";
import { MusicQueriesCrudModule } from "#musics/queries/crud/module";
import { MusicUsersListsController } from "./controller";
import { MusicUsersListsRepository } from "./repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => MusicPlaylistsModule),
    forwardRef(() => MusicQueriesCrudModule),
  ],
  controllers: [MusicUsersListsController],
  providers: [MusicUsersListsRepository],
  exports: [MusicUsersListsRepository],
} )
export class MusicUsersListsModule {}
