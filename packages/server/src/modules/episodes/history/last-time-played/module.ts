/* eslint-disable import/no-cycle */
import { Module } from "@nestjs/common";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeHistoryCrudModule } from "../crud/module";
import { EpisodeLastTimePlayedService } from "./service";

@Module( {
  imports: [
    EpisodesCrudModule,
    EpisodeHistoryCrudModule,
  ],
  controllers: [
  ],
  providers: [
    EpisodeLastTimePlayedService,
  ],
  exports: [EpisodeLastTimePlayedService],
} )
export class EpisodeLastTimePlayedModule {}
