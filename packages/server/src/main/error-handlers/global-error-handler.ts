import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { genOutputStackError } from "../logging/interceptor";

@Injectable()
export class GlobalErrorHandlerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(GlobalErrorHandlerService.name);

  onApplicationBootstrap() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handler para excepciones no capturadas
    process.on("uncaughtException", (error: Error) => {
      this.onUncaughtException(error);
    } );

    // Handler para promesas rechazadas no capturadas
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      this.logger.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Opcional: convertir en uncaughtException si quieres consistencia
      throw reason;
    } );

    // Handler opcional para warnings
    process.on("warning", (warning: Error) => {
      this.logger.warn("Process Warning:", warning.message);
    } );

    this.logger.log("Global error handlers initialized");
  }

  onUncaughtException(error: Error) {
    const stack = error.stack ? genOutputStackError(error.stack) : "";

    this.logger.error(
      `Uncaught Exception.\n${error.name}: ${error.message}${stack ? `\n${stack}` : ""}`,
    );

    throw error;
  }
}

@Module( {
  providers: [GlobalErrorHandlerService],
  exports: [GlobalErrorHandlerService],
} )
export class GlobalErrorHandlerModule {}
