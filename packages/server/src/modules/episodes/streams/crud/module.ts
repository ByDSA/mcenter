import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersModule } from "#core/auth/users";
import { StreamsCrudController } from "./controller";
import { StreamsRepository } from "./repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    UsersModule,
  ],
  controllers: [
    StreamsCrudController,
  ],
  providers: [
    StreamsRepository,
  ],
  exports: [StreamsRepository],
} )
export class StreamsCrudModule {}
