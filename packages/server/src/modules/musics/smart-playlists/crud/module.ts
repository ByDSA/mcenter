import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersModule } from "#core/auth/users";
import { SmartPlaylistCrudController } from "./controller";
import { MusicSmartPlaylistRepository } from "./repository/repository";
import { MusicSmartPlaylistAvailableSlugGeneratorService } from "./repository/available-slug-generator.service";

@Module( {
  imports: [DomainEventEmitterModule, UsersModule],
  controllers: [SmartPlaylistCrudController],
  providers: [
    MusicSmartPlaylistRepository,
    MusicSmartPlaylistAvailableSlugGeneratorService,
  ],
  exports: [MusicSmartPlaylistRepository],
} )
export class MusicSmartPlaylistsCrudModule {}
