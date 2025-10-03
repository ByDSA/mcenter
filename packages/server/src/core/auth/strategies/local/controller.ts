/* eslint-disable require-await */
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { UserEntityWithRoles } from "$shared/models/auth";
import { PostOne } from "#utils/nestjs/rest";
import { GuestOnly } from "#core/auth/users/GuestOnly.guard";
import { userEntityWithRolesSchema } from "#core/auth/users/models";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { AppPayloadService } from "../jwt";
import { AuthLocalService } from "./service";
import { SignUpDto } from "./dto";

const tokenSchema = z.object( {
  token: z.string(),
} );

class NewTokenBody extends createZodDto(z.object( {
  email: z.string().email(),
} )) {}

@GuestOnly()
@Controller("/local")
export class AuthPassController {
  private logger = new Logger(AuthPassController.name);

  constructor(
    private readonly authPassService: AuthLocalService,
    private readonly usersRepo: UsersRepository,
    private readonly appPayloadService: AppPayloadService,
  ) { }

  @Post("/signup")
  @HttpCode(HttpStatus.ACCEPTED)
  async signUp(
    @Body() dto: SignUpDto,
  ) {
    await this.authPassService.signUp(dto);
  }

  @UseGuards(AuthGuard("local"))
  @PostOne("/login", userEntityWithRolesSchema)
  async login(
    @Req() req: Request,
  ) {
    return req.user;
  }

  @Post("email-verification/verify")
  async emailVerification(
    @Body() body: unknown,
  ) {
    // Por motivos de seguridad, el usuario no recibe el motivo del error
    try {
      const parsedBody = tokenSchema.parse(body);
      const { token } = parsedBody;

      if (!token)
        throw new UnprocessableEntityException("Token is required");

      const userPass = await this.authPassService.verifyEmail(token);

      assertFoundClient(userPass);

      const user = await this.usersRepo.getOneById(userPass.userId, {
        expand: ["roles"],
      } ) as UserEntityWithRoles | null;

      assertFoundServer(user);

      this.appPayloadService.login(user);

      return;
    } catch (e) {
      this.logger.error(e);

      throw new UnprocessableEntityException("Error verifyng token");
    }
  }

  @Post("email-verification/resend")
  @HttpCode(HttpStatus.ACCEPTED)
  async emailVerificationRequireNewToken(
    @Body() body: NewTokenBody,
  ) {
    // Por motivos de seguridad, el usuario siempre recibe que se realizó correctamente
    try {
      await this.authPassService.requestNewToken(body.email);
    } catch (e) {
      this.logger.error(e);
    }

    return;
  }
}
