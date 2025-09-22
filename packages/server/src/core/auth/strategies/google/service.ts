import { Injectable } from "@nestjs/common";
import { Request } from "express";
import z from "zod";
import { UserEntityWithRoles, UserSignUpDto } from "#core/auth/users/dto/user.dto";
import { UsersService } from "#core/auth/users";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { AppPayloadService } from "../jwt";

const googleUserSchema = z.object( {
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  picture: z.string(),
  accessToken: z.string(),
} );

type GoogleUser = z.infer<typeof googleUserSchema>;

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly appPayloadService: AppPayloadService,
    private readonly usersService: UsersService,
    private readonly usersRepo: UsersRepository,
  ) { }

  async googleRedirect(req: Request) {
    if (!req.user)
      return "No user from google";

    const googleUser = googleUserSchema.parse(req.user);
    const { email } = googleUser;
    let user = await this.usersRepo.getOneByEmail(email, {
      expand: ["roles"],
    } ) as UserEntityWithRoles | null;

    if (!user)
      user = await this.signUp(googleUser);

    this.login(user);

    return user;
  }

  private login(user: UserEntityWithRoles) {
    this.appPayloadService.putUser(user);
    this.appPayloadService.persist();
  }

  private async signUp(googleUser: GoogleUser): Promise<UserEntityWithRoles> {
    const insertingUser: UserSignUpDto = {
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      publicName: `${googleUser.firstName} ${googleUser.lastName}`,
    };

    return await this.usersService.signUp(insertingUser);
  }
}
