import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { DevModule } from "../dev/module";
import { DatabaseModule } from "../db/module";
import { SchedulerModule } from "../scheduler/module";
import { routeModules } from "../routing/routes";
import { LoggingModule } from "../logging/module";
import { GlobalErrorHandlerModule } from "../error-handlers/global-error-handler";
import { globalValidationProviders, InitService } from "./init.service";

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
    LoggingModule.forRoot(),
    GlobalErrorHandlerModule,
    ...routeModules,
    SchedulerModule,
    DatabaseModule,
  ],
  providers: [
    ...globalValidationProviders,
    InitService,
  ],
} )
export class AppModule { }
