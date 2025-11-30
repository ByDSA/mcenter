import { Module } from "@nestjs/common";
import { MailsModule } from "#core/mails/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UserRolesRepository } from "./roles/repository";
import { UsersService } from "./service";
import { UserRoleMapRepository } from "./roles/user-role";
import { UsersRepository } from "./crud/repository";
import { UserPublicUsernameService } from "./public-username.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
    MailsModule,
  ],
  providers: [
    UserRolesRepository,
    UsersService,
    UsersRepository,
    UserRoleMapRepository,
    UserPublicUsernameService,
  ],
  controllers: [],
  exports: [UsersService, UsersRepository, UserRolesRepository, UserPublicUsernameService],
} )
export class UsersModule {}
