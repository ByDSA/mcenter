import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MailsModule } from "#core/mails/module";
import { UserRolesRepository } from "./roles/repository";
import { UsersService } from "./service";
import { UserRoleMapRepository } from "./roles/user-role";
import { UsersRepository } from "./crud/repository";

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
  ],
  exports: [UsersService, UsersRepository, UserRolesRepository],
} )
export class UsersModule {}
