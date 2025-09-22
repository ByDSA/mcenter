/* eslint-disable require-await */
import { Body, Controller, HttpCode, HttpException, HttpStatus, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { PostOne } from "#utils/nestjs/rest";
import { userEntityWithRolesSchema } from "#core/auth/users/dto/user.dto";
import { GuestOnly } from "#core/auth/users/GuestOnly.guard";
import { SignUpDto } from "./dto/SignUp";
import { AuthLocalService, SignUpStatus } from "./service";

@GuestOnly()
@Controller("/local")
export class AuthPassController {
  constructor(
    private readonly authPassService: AuthLocalService,
  ) { }

  @PostOne("/signup", userEntityWithRolesSchema)
  @HttpCode(HttpStatus.OK)
  async signUp(
    @Body() dto: SignUpDto,
  ) {
    const { status, user } = await this.authPassService.signUp(dto);

    switch (status) {
      case SignUpStatus.Success: return user;
      case SignUpStatus.PendingEmail: throw new HttpException( {
        message: "Pending email",
      }, HttpStatus.ACCEPTED);
      default: throw new Error();
    }
  }

  @UseGuards(AuthGuard("local"))
  @PostOne("/login", userEntityWithRolesSchema)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
  ) {
    return req.user;
  }
}
