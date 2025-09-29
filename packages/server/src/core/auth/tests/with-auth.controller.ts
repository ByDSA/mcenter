/* eslint-disable require-await */
import { Controller, Get } from "@nestjs/common";
import { UserPayload, UserRoleName } from "../users/models";
import { GuestOnly } from "../users/GuestOnly.guard";
import { User } from "../users/User.decorator";
import { Roles } from "../users/roles/Roles.guard";
import { Authenticated } from "../users/Authenticated.guard";

@Controller("/")
export class WithAuthController {
  constructor() { }

  @Get("/")
  async getTest(@User() user: UserPayload | null) {
    if (user)
      return `Hola, ${user.publicName}!`;

    return "Sesión no iniciada";
  }

  @Get("/user")
  @Authenticated()
  @Roles(UserRoleName.USER)
  async getUser(@User() user: UserPayload) {
    return `Hola, usuario ${user.publicName}!`;
  }

  @Get("/admin")
  @Authenticated()
  @Roles(UserRoleName.ADMIN)
  async getAdmin(@User() user: UserPayload) {
    return `Hola, admin ${user.publicName}!`;
  }

  @Get("/logged")
  @Authenticated()
  async getPrivate(@User() user: UserPayload) {
    return `Hola, ${user.publicName}!`;
  }

  @Get("/guest")
  @GuestOnly()
  async getLogin() {
    return "Hola, invitado!";
  }
}
