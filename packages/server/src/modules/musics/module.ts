import { Module } from "@nestjs/common";
import { TSYRINGE_PROVIDERS } from "#main/TSYRINGE_PROVIDERS";
import { MusicsHistoryModule } from "./history/controllers/module";
import { MusicGetController } from "./controllers/GetController";
import { MusicFixController } from "./controllers/FixController";
import { UpdateRemoteTreeService } from "./services";
import { MusicRestController } from "./controllers/RestController";
import { MusicUpdateRemoteController } from "./controllers/UpdateRemoteController";

@Module( {
  imports: [
    MusicsHistoryModule,
  ],
  controllers: [
    MusicRestController,
    MusicGetController,
    MusicFixController,
    MusicUpdateRemoteController,
  ],
  providers: [
    UpdateRemoteTreeService,
    ...TSYRINGE_PROVIDERS,
  ],
  exports: [],
} )
export class MusicsModule {}
