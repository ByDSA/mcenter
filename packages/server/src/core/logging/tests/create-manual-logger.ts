import winston from "winston";
import { Logger } from "@nestjs/common";
import { createLoggerConfig } from "../config";
import { CustomLoggerService } from "../service";

// Para cuando se usa el Logger, pero aún no se ha iniciado el TestingModule
// O para LoggingInterceptor (no sé por qué)
export function createManualLogger(context: string): Logger {
  const winstonLogger = winston.createLogger(createLoggerConfig());
  const customLogger = new CustomLoggerService(winstonLogger);
  // Envolver en un Logger de NestJS con contexto
  const nestLogger = new Logger(context);

  // Reemplazar los métodos del Logger con los del CustomLoggerService
  nestLogger.log = (message: string) => customLogger.log(message, context);
  nestLogger.error = (
    message: string,
    trace?: string,
  ) => customLogger.error(message, trace, context);
  nestLogger.warn = (message: string) => customLogger.warn(message, context);
  nestLogger.debug = (message: string) => customLogger.debug(message, context);
  nestLogger.verbose = (message: string) => customLogger.verbose(message, context);

  return nestLogger;
}
