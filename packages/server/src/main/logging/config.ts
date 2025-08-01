import type { LoggingModuleProps } from "./module";
import { isDebugging } from "$shared/utils/vscode";
import { utilities as nestWinstonModuleUtilities } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";

const IS_DEBUGGING = isDebugging();
const IS_TEST = process.env.NODE_ENV === "test";

export const LOGS_FOLDER = IS_TEST ? "tests/logs/" : "logs/";

const SILENT_CONSOLE = IS_TEST
  && !IS_DEBUGGING;

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
        } ),
      ],
  } satisfies winston.LoggerOptions;
};
