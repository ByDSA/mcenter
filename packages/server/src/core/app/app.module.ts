import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { MeilisearchModule } from "#modules/search/module";
import { UsersModule } from "#core/auth/users/module";
import { AuthModule } from "#core/auth/strategies/jwt";
import { isDev } from "#utils";
import { AuthGoogleModule } from "#core/auth/strategies/google";
import { DevModule } from "../dev/module";
import { DatabaseModule } from "../db/module";
import { SchedulerModule } from "../scheduler/module";
import { routeModules } from "../routing/routes";
import { LoggingModule } from "../logging/module";
import { GlobalErrorHandlerModule } from "../error-handlers/global-error-handler";
import { globalAuthProviders, globalValidationProviders, InitService } from "./init.service";

const isDevEnv = isDev();

@Module( {
  imports: [
    ...(isDevEnv
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
    MeilisearchModule,
    ...routeModules,
    SchedulerModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    AuthGoogleModule,
  ],
  providers: [
    ...globalValidationProviders,
    ...globalAuthProviders,
    InitService,
  ],
} )
export class AppModule { }
