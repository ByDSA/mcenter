import { Injectable } from "@nestjs/common";
import { Request } from "express";
import z from "zod";
import { UsersService } from "#core/auth/users";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { User, UserEntityWithRoles } from "../../users/models";
import { AppPayloadService } from "../jwt";

type SignUpResult = {
  user: UserEntityWithRoles;
  state: "created" | "nothing" | "verified";
};

const googleUserSchema = z.object( {
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  picture: z.string(),
  accessToken: z.string(),
} );

export type GoogleUser = z.infer<typeof googleUserSchema>;

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepo: UsersRepository,
    private readonly appPayloadService: AppPayloadService,
  ) { }

  async googleRedirect(req: Request) {
    if (!req.user)
      return "No user from google";

    const googleUser = googleUserSchema.parse(req.user);
    const { user } = await this.signUpOrGet(googleUser);

    this.appPayloadService.login(user);

    return user;
  }

  async signUpOrGet(googleUser: GoogleUser): Promise<SignUpResult> {
    let state: SignUpResult["state"] = "nothing";
    let userWithRoles = await this.usersRepo.getOneByEmail(googleUser.email, {
      expand: ["roles"],
    } ) as UserEntityWithRoles | null;

    if (!userWithRoles) {
      const insertingUser = googleUserToSignUpUser(googleUser);

      userWithRoles = await this.usersService.signUp(insertingUser);
      state = "created";
    // Local auth unverificated:
    } else if (!userWithRoles.emailVerified) {
      const user = await this.usersRepo.patchOneByIdAndGet(
        userWithRoles.id,
        {
          entity: googleUserToSignUpUser(googleUser),
        },
      );

      userWithRoles = {
        ...userWithRoles,
        ...user,
      };

      state = "verified";
    }

    return {
      user: userWithRoles,
      state,
    };
  }
}

function googleUserToSignUpUser(googleUser: GoogleUser): Omit<User, "roles"> {
  return {
    email: googleUser.email,
    firstName: googleUser.firstName,
    lastName: googleUser.lastName,
    publicName: `${googleUser.firstName} ${googleUser.lastName}`,
    emailVerified: true,
  };
}
