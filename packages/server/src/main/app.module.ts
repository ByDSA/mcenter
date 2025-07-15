import { Module, OnModuleInit } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { ConfigModule } from "#modules/config/config.module";
import { globalValidationProviders, InitService } from "./init.service";
import { DevModule } from "./dev/module";
import { DatabaseModule } from "./db/module";
import { SchedulerModule } from "./scheduler/module";
import { routeModules } from "./routes";

const isDev = process.env.NODE_ENV === "development";

@Module( {
  imports: [
    ...(isDev
      ? [
        DevModule,
        RouterModule.register([{
          path: "/",
          module: DevModule,
        }]),
      ]
      : []),
    SchedulerModule,
    DatabaseModule,
    ConfigModule,
    ...routeModules,
  ],
  providers: [
    ...globalValidationProviders,
    InitService,
  ],
} )
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log("AppModule initialized");
  }
}
