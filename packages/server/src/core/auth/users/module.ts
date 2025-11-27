import { forwardRef, Module } from "@nestjs/common";
import { MailsModule } from "#core/mails/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersMusicPlaylistsModule } from "#musics/users-playlists/module";
import { UserRolesRepository } from "./roles/repository";
import { UsersService } from "./service";
import { UserRoleMapRepository } from "./roles/user-role";
import { UsersRepository } from "./crud/repository";
import { UsersController } from "./crud/controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    MailsModule,
    forwardRef(()=>UsersMusicPlaylistsModule),
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
