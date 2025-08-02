import { Controller, Get } from "@nestjs/common";

@Controller()
export class DevController {
  @Get()
  main() {
    return "Hello world!";
  }
}
