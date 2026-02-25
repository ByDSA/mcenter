import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MovieCrudModule } from "#modules/movies/crud/module";
import { MovieFileInfoRepository } from "./repository";
import { MovieFileInfoController } from "./controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    MovieCrudModule,
  ],
  controllers: [
    MovieFileInfoController,
  ],
  providers: [
    MovieFileInfoRepository,
  ],
  exports: [MovieFileInfoRepository],
} )
export class MovieFileInfoCrudModule {}
