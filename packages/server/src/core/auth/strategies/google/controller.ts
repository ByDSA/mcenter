import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AppPayloadService } from "../jwt";
import { GoogleGuard } from "./google.guard";
import { AuthGoogleService } from "./service";

@Controller("google")
export class GoogleController {
  constructor(
    private readonly service: AuthGoogleService,
    private readonly appPayloadService: AppPayloadService,
  ) {}

  @Get("/")
  @UseGuards(GoogleGuard)
  // eslint-disable-next-line no-empty-function
  googleAuth() {
  }

  @Get("redirect")
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@Req() req: Request) {
    await this.service.googleRedirect(req);

    const lastPage = this.appPayloadService.getLastPage();

    return req?.res?.redirect(lastPage);
  }
}
