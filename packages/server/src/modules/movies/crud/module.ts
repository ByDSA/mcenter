import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MovieCrudController } from "./controller";
import { MovieRepository } from "./repositories/movie";

@Module( {
  imports: [DomainEventEmitterModule],
  controllers: [MovieCrudController],
  providers: [MovieRepository],
  exports: [MovieRepository],
} )
export class MovieCrudModule {}
