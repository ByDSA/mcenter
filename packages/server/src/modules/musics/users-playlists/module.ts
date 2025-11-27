import { Module } from "@nestjs/common";
import { MailsModule } from "#core/mails/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicPlaylistsModule } from "#musics/playlists/module";
import { UsersMusicPlaylistsRepository } from "./repository";
import { UsersMusicController } from "./controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    MailsModule,
    MusicPlaylistsModule,
  ],
  providers: [UsersMusicPlaylistsRepository],
  controllers: [UsersMusicController],
  exports: [UsersMusicPlaylistsRepository],
} )
export class UsersMusicPlaylistsModule {}
