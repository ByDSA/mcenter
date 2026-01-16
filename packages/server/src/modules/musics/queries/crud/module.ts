import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersModule } from "#core/auth/users";
import { QueriesCrudController } from "./controller";
import { MusicQueriesRepository } from "./repository/repository";
import { MusicQueryAvailableSlugGeneratorService } from "./repository/available-slug-generator.service";

@Module( {
  imports: [DomainEventEmitterModule, UsersModule],
  controllers: [QueriesCrudController],
  providers: [
    MusicQueriesRepository,
    MusicQueryAvailableSlugGeneratorService,
  ],
  exports: [MusicQueriesRepository],
} )
export class MusicQueriesCrudModule {}
