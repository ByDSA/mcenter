import { Module } from "@nestjs/common";
import { StreamFileService } from "./service";

@Module( {
  imports: [
  ],
  controllers: [
  ],
  providers: [
    StreamFileService,
  ],
  exports: [StreamFileService],
} )
export class StreamFileModule {}
