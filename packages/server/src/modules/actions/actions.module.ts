import { Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { ActionController } from "./main.controller";

@Module( {
  imports: [
    SeriesModule,
    StreamsModule,
  ],
  controllers: [
    ActionController,
  ],
  providers: [
  ],
} )
export class ActionsModule {
}
