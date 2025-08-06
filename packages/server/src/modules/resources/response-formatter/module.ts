import { Module } from "@nestjs/common";
import { ResponseFormatInterceptor } from "./response-format.interceptor";
import { ResponseFormatterService } from "./response-formatter.service";

@Module( {
  imports: [],
  providers: [ResponseFormatterService, ResponseFormatInterceptor],
  controllers: [],
  exports: [ResponseFormatInterceptor, ResponseFormatterService],
} )
export class ResourceResponseFormatterModule {}
