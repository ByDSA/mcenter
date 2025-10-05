import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { genOutputStackError } from "../logging/interceptor";

type Handler = (...args: any[])=> void;
@Injectable()
export class GlobalErrorHandlerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(GlobalErrorHandlerService.name);

   private handlers = new Map<string, Handler>();

   onApplicationBootstrap() {
     this.setupGlobalErrorHandlers();
   }

   onApplicationShutdown() {
     this.removeHandlers();
   }

   private setupGlobalErrorHandlers() {
     const uncaughtHandler = (error: Error) => this.onUncaughtException(error);
     const rejectionHandler = (reason: any, promise: Promise<any>) => {
       this.logger.error("Unhandled Rejection at:", promise, "reason:", reason);
       throw reason;
     };
     const warningHandler = (warning: Error) => {
       this.logger.warn("Process Warning:", warning.message);
     };

     this.handlers.set("uncaughtException", uncaughtHandler);
     this.handlers.set("unhandledRejection", rejectionHandler);
     this.handlers.set("warning", warningHandler);

     process.on("uncaughtException", uncaughtHandler);
     process.on("unhandledRejection", rejectionHandler);
     process.on("warning", warningHandler);

     this.logger.log("Global error handlers initialized");
   }

   private removeHandlers() {
     this.handlers.forEach((handler, event) => {
       process.off(event as any, handler);
     } );
     this.handlers.clear();
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
