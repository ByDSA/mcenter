import type { LoggingModuleProps } from "./module";
import { isDebugging } from "$shared/utils/vscode";
import { utilities as nestWinstonModuleUtilities } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";
import { isTest } from "#utils";

const IS_TEST = isTest();

export const LOGS_FOLDER = IS_TEST ? "tests/logs/" : "logs/";

const SILENT_CONSOLE = IS_TEST
  && !isDebugging();

export const createLoggerConfig = (props?: LoggingModuleProps) => {
  const silentFiles = props?.silentFiles ?? SILENT_CONSOLE;

  return {
    level: "debug",
    transports: [
      new winston.transports.Console( {
        silent: SILENT_CONSOLE,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(undefined, {
            colors: true,
            appName: false,
            processId: false,
            prettyPrint: true,
          } ),
        ),
      } ),

      // Archivo para errores únicamente
      new winston.transports.DailyRotateFile( {
        silent: silentFiles,
        filename: `${LOGS_FOLDER}/error-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxSize: "20m",
        maxFiles: "14d",
        handleExceptions: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors( {
            stack: true,
          } ),
          winston.format.json(),
        ),
      } ),

      // Archivo para todos los logs
      new winston.transports.DailyRotateFile( {
        silent: silentFiles,
        filename: `${LOGS_FOLDER}/combined-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        handleExceptions: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      } ),
    ],

    // Manejo de excepciones no capturadas
    exceptionHandlers: [
      new winston.transports.DailyRotateFile( {
        silent: silentFiles,
        filename: `${LOGS_FOLDER}/exceptions-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        handleExceptions: true,
      } ),
    ],

    // Manejo de promesas rechazadas
    rejectionHandlers: silentFiles
      ? []
      : [
        new winston.transports.DailyRotateFile( {
          filename: "logs/rejections-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "14d",
          handleExceptions: true,
        } ),
      ],
    exitOnError: false,
  } satisfies winston.LoggerOptions;
};
