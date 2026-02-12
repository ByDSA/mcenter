import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersModule } from "#core/auth/users";
import { SmartPlaylistCrudController } from "./controller";
import { MusicSmartPlaylistRepository } from "./repository/repository";
import { MusicSmartPlaylistAvailableSlugGeneratorService } from "./repository/available-slug-generator.service";
import { GuardOwnerService } from "./guard-owner.service";

@Module( {
  imports: [DomainEventEmitterModule, UsersModule],
  controllers: [SmartPlaylistCrudController],
  providers: [
    MusicSmartPlaylistRepository,
    MusicSmartPlaylistAvailableSlugGeneratorService,
    GuardOwnerService,
  ],
  exports: [MusicSmartPlaylistRepository],
} )
export class MusicSmartPlaylistsCrudModule {}
