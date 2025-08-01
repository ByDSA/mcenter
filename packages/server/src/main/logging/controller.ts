import fs from "node:fs";
import path from "node:path";
import { Controller, Get, Logger } from "@nestjs/common";
import { LOGS_FOLDER } from "./config";

type LogEntry = {
  context: string;
  level: "info";
  message: string;
  timestamp: Date;
};

@Controller()
export class LoggingController {
  private readonly logger = new Logger(LoggingController.name);

  @Get("/")
  log() {
    if (!fs.existsSync(LOGS_FOLDER))
      return "No log folder found";

    const files = fs.readdirSync(LOGS_FOLDER)
      .filter(file => file.match(/^combined-.*\.log$/))
      .map(file => {
        const filePath = path.join(LOGS_FOLDER, file);
        const stats = fs.statSync(filePath);

        return {
          name: file,
          path: filePath,
          mtime: stats.mtime,
        };
      } )
    // Ordenar por fecha de modificación (más recientes primero)
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length === 0)
      return "No log files found";

    const TARGET_LINES = 200;
    let allLogEntries = new Array<LogEntry>(TARGET_LINES);
    let counter = TARGET_LINES - 1;

    // eslint-disable-next-line no-restricted-syntax
    main: for (const logFile of files) {
      const fileContent = fs.readFileSync(logFile.path, "utf8");
      const lines = fileContent.split("\n");

      for (let i = lines.length - 1; i >= 0; i--) {
        if (counter < 0)
          break main; // Ya tenemos suficientes líneas

        try {
          const logEntry = JSON.parse(lines[i]) as LogEntry;

          // Asegurar que timestamp sea un objeto Date
          if (typeof logEntry.timestamp === "string")
            logEntry.timestamp = new Date(logEntry.timestamp);

          allLogEntries[counter] = logEntry;
          counter--;
        } catch {
          // Ignorar líneas que no se pueden parsear como JSON
          // El último carácter del log siemrpe es un \n (última línea vacía)
          if (lines[i].trim() !== "")
            this.logger.warn(`Could not parse log line: ${lines[i]}`);
        }
      }
    }

    return allLogEntries.reduce((acc, e) => {
      if (e === undefined)
        return acc;

      const formattedTimestamp = e.timestamp.toLocaleString("sv-SE");

      acc.push(`${formattedTimestamp} ${e.level} [${e.context ?? ""}]: ${e.message}`);

      return acc;
    }, [] as string[]);
  }
}
