/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MeilisearchModule } from "#modules/search/module";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { MusicHistoryModule } from "../history/module";
import { MusicFileInfoModule } from "../file-info/module";
import { MusicFlowService } from "../MusicFlow.service";
import { MusicRendererModule } from "../renderer/module";
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
    MusicRendererModule,
    ResourceResponseFormatterModule,
  ],
  controllers: [
    MusicCrudController,
  ],
  providers: [
    MusicFlowService,
    MusicsRepository,
    MusicsUsersRepository,
    MusicAvailableSlugGeneratorService,
    MusicBuilderService,
    GetManyByCriteriaMusicRepoService,
  ],
  exports: [MusicBuilderService, MusicsRepository, MusicsUsersRepository, MusicFlowService],
} )
export class MusicsCrudModule {}
