import { Module } from "@nestjs/common";
import { StreamFileModule } from "#modules/resources/stream-file/module";
import { MusicRendererService } from "./renderer.service";
import { MusicRendererInterceptor } from "./renderer.interceptor";
import { MusicResponseFormatterService } from "./formatter.service";

@Module( {
  imports: [
    StreamFileModule,
  ],
  controllers: [
  ],
  providers: [
    MusicRendererService,
    MusicResponseFormatterService,
    MusicRendererInterceptor,
  ],
  exports: [MusicRendererService,
    MusicResponseFormatterService,
    MusicRendererInterceptor,
  ],
} )
export class MusicRendererModule {}
