import { Module } from "@nestjs/common";
import { UserRolesRepository } from "./roles/repository";
import { UsersService } from "./service";
import { UserRoleMapRepository } from "./roles/user-role";
import { UsersRepository } from "./crud/repository";
import { UsersController } from "./crud/controller";
import { MailsModule } from "#core/mails/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicPlaylistsModule } from "#musics/playlists/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
    MailsModule,
    MusicPlaylistsModule,
  ],
  providers: [
    UserRolesRepository,
    UsersService,
    UsersRepository,
    UserRoleMapRepository,
  ],
  controllers: [UsersController],
  exports: [UsersService, UsersRepository, UserRolesRepository],
} )
export class UsersModule {}
