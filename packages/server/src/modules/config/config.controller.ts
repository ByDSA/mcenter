import * as fs from "fs";
import { Controller, Get } from "@nestjs/common";

@Controller("config")
export class ConfigController {
  @Get("stop")
  stop() {
    fs.writeFileSync(".stop", "");

    return "Stopped!";
  }

  @Get("resume")
  resume() {
    if (fs.existsSync(".stop")) {
      fs.unlinkSync(".stop");

      return "Resumed!";
    } else
      return "Already resumed";
  }
}
