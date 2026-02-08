import { Module } from "@nestjs/common";
import { MusicResponseFormatInterceptor } from "./music-response-format.interceptor";
import { EpisodeResponseFormatterService } from "./episode-response-formatter.service";
import { MusicResponseFormatterService } from "./music-response-formatter.service";
import { EpisodeResponseFormatInterceptor } from "./episode-response-format.interceptor";

@Module( {
  imports: [],
  providers: [
    EpisodeResponseFormatterService,
    EpisodeResponseFormatInterceptor,
    MusicResponseFormatterService,
    MusicResponseFormatInterceptor,
  ],
  controllers: [],
  exports: [
    EpisodeResponseFormatInterceptor,
    EpisodeResponseFormatterService,
    MusicResponseFormatInterceptor,
    MusicResponseFormatterService,
  ],
} )
export class ResourceResponseFormatterModule {}
