import { Module, OnModuleInit } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { MusicsModule } from "#musics/module";
import { MusicsHistoryModule } from "#musics/history/controllers/module";
import { globalValidationProviders, InitService } from "./init.service";
import { TSYRINGE_PROVIDERS } from "./TSYRINGE_PROVIDERS";

@Module( {
  imports: [
    MusicsModule,
    RouterModule.register([
      {
        path: "/api/musics",
        module: MusicsModule,
        children: [
          {
            path: "history",
            module: MusicsHistoryModule,
          },
        ],
      },
    ]),
  ],
  providers: [
    ...TSYRINGE_PROVIDERS,
    InitService,
    ...globalValidationProviders,
  ],
} )
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log("AppModule initialized");
  }
}
