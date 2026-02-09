import { Module } from "@nestjs/common";
import { StreamFileModule } from "#modules/resources/stream-file/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { EpisodeResponseFormatterService } from "./formatter.service";
import { EpisodeRendererInterceptor } from "./renderer.interceptor";
import { EpisodeRendererService } from "./renderer.service";

@Module( {
  imports: [
    StreamFileModule,
    EpisodeHistoryCrudModule, // TODO: quitar
  ],
  providers: [
    EpisodeResponseFormatterService,
    EpisodeRendererInterceptor,
    EpisodeRendererService,
  ],
  controllers: [],
  exports: [
    EpisodeRendererInterceptor,
    EpisodeResponseFormatterService,
    EpisodeRendererService,
  ],
} )
export class EpisodeResponseFormatterModule {}
