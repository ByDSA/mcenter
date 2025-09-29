import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { AppPayloadService } from "./strategies/jwt";

@Controller()
export class AuthController {
  constructor(
    private readonly appPayloadService: AppPayloadService,
  ) { }

  @Get("/logout")
  @HttpCode(HttpStatus.OK)
  logout() {
    this.appPayloadService.logout();

    return "Logout!";
  }
}
