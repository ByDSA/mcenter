import { DynamicModule, Global, Logger, Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { createLoggerConfig } from "./config";
import { CustomLoggerService } from "./service";
import { LoggingController } from "./controller";

export type LoggingModuleProps = {
  silentFiles?: boolean;
};

@Global()
@Module( {} )
export class LoggingModule {
  static forRoot(props?: LoggingModuleProps): DynamicModule {
    return {
      module: LoggingModule,
      imports: [
        WinstonModule.forRoot(
          createLoggerConfig(props),
        ),
      ],
      providers: [
        {
          provide: Logger,
          useClass: CustomLoggerService,
        },
      ],
      controllers: [LoggingController],
      exports: [Logger],
    };
  }
}
