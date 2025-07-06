import { Module } from "@nestjs/common";
import { TSYRINGE_PROVIDERS } from "#main/TSYRINGE_PROVIDERS";
import { MusicRepository } from "#musics/repositories";
import { MusicHistoryRepository } from "../repositories";
import { MusicHistoryRestController } from "./RestController";

@Module( {
  imports: [],
  controllers: [MusicHistoryRestController],
  providers: [
    ...TSYRINGE_PROVIDERS,
    MusicRepository,
    MusicHistoryRepository,
  ],
  exports: [MusicHistoryRepository],
} )
export class MusicsHistoryModule {}
