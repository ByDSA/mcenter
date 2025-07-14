import path from "node:path";
import fs from "node:fs";
import { assertIsDefined } from "$shared/utils/validation";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class ActionController {
  @Get("/log")
  log() {
    try {
      const { TMP_PATH } = process.env;

      assertIsDefined(TMP_PATH);
      const pathFile = path.join(TMP_PATH, ".log");
      const log = fs.readFileSync(pathFile, "utf-8");

      return log;
    } catch {
      return "No log file";
    }
  }
}
