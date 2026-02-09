import { Module } from "@nestjs/common";
import { SeriesCrudModule } from "#episodes/series/crud/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersModule } from "#core/auth/users";
import { StreamsCrudModule } from "../crud/module";
import { FixerController } from "./controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesCrudModule,
    StreamsCrudModule,
    UsersModule,
  ],
  controllers: [
    FixerController,
  ],
  providers: [
  ],
  exports: [],
} )
export class StreamsFixerModule {}
