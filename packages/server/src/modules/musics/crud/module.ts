/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MeilisearchModule } from "#modules/search/module";
import { MusicHistoryModule } from "../history/module";
import { MusicFileInfoModule } from "../file-info/module";
import { MusicsUsersRepository } from "./repositories/user-info/repository";
import { MusicBuilderService } from "./builder/music-builder.service";
import { MusicCrudController } from "./controller";
import { MusicsRepository } from "./repositories/music";
import { MusicAvailableSlugGeneratorService } from "./builder/available-slug-generator.service";
import { GetManyByCriteriaMusicRepoService } from "./repositories/music/get-many-criteria";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(()=>MusicFileInfoModule),
    forwardRef(()=>MusicHistoryModule),
    MeilisearchModule,
  ],
  controllers: [
    MusicCrudController,
  ],
  providers: [
    MusicsRepository,
    MusicsUsersRepository,
    MusicAvailableSlugGeneratorService,
    MusicBuilderService,
    GetManyByCriteriaMusicRepoService,
  ],
  exports: [MusicBuilderService, MusicsRepository, MusicsUsersRepository],
} )
export class MusicsCrudModule {}
