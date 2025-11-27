import { forwardRef, Module } from "@nestjs/common";
import { MailsModule } from "#core/mails/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicPlaylistsModule } from "#musics/playlists/module";
import { UsersModule } from "#core/auth/users";
import { UsersMusicPlaylistsRepository } from "./repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    MailsModule,
    MusicPlaylistsModule,
    forwardRef(()=>UsersModule),
  ],
  providers: [UsersMusicPlaylistsRepository],
  controllers: [],
  exports: [UsersMusicPlaylistsRepository],
} )
export class UsersMusicPlaylistsModule {}
