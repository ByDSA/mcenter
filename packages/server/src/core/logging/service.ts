import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import * as winston from "winston";

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  log(message: string, context?: string): void {
    this.logger.info(message, {
      context,
    } );
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, {
      context,
      trace,
    } );
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, {
      context,
    } );
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, {
      context,
    } );
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, {
      context,
    } );
  }

  // Métodos adicionales para casos específicos
  info(message: string, context?: string): void {
    this.logger.info(message, {
      context,
    } );
  }

  http(message: string, context?: string): void {
    this.logger.http(message, {
      context,
    } );
  }

  // Método para logging con metadatos adicionales
  logWithMeta(level: string, message: string, meta: any): void {
    this.logger.log(level, message, meta);
  }

  // Método para crear child logger con contexto fijo
  child(defaultMeta: any): winston.Logger {
    return this.logger.child(defaultMeta);
  }

  // Obtener la instancia de winston directamente si es necesario
  getWinstonInstance(): winston.Logger {
    return this.logger;
  }
}
