import { Module } from "@nestjs/common";
import { MailsModule } from "#core/mails/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UserRolesRepository } from "./roles/repository";
import { UsersService } from "./service";
import { UserRoleMapRepository } from "./roles/user-role";
import { UsersRepository } from "./crud/repository";
import { UserSlugService } from "./user-slug.service";

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
    UserSlugService,
  ],
  controllers: [],
  exports: [UsersService, UsersRepository, UserRolesRepository, UserSlugService],
} )
export class UsersModule {}
