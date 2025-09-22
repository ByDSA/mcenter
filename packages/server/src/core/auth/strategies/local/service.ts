import type { LoginDto } from "./dto/Login";
import type { SignUpDto } from "./dto/SignUp";
import type { UserDto, UserEntityWithRoles } from "#core/auth/users/dto/user.dto";
import { ConflictException, Injectable } from "@nestjs/common";
import { compare } from "bcryptjs";
import { assertIsDefined } from "$shared/utils/validation";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { UsersService } from "#core/auth/users";
import { AlreadyExistsEmail } from "#core/auth/users/crud/repository/errors";
import { AppPayloadService } from "../jwt/payload/AppPayloadService";
import { UserRoleName } from "../../users/roles/role";
import { hashPassword } from "../../users/utils";
import { UserPayload } from "../jwt/payload/AppPayload";
import { type UserPass, UserPassesRepository } from "./user-pass";
import { UserPassEntityWithUserWithRoles } from "./user-pass/userPass.entity";

export enum SignUpStatus {
  Success = "success",
  PendingEmail = "pending-email",
}

type SignUpRet = {
  user: UserEntityWithRoles | null;
  status: SignUpStatus;
};

@Injectable()
export class AuthLocalService {
  constructor(
    private readonly userPassRepo: UserPassesRepository,
    private readonly usersService: UsersService,
    private readonly usersRepo: UsersRepository,
    private readonly appPayloadService: AppPayloadService,
  ) {
  }

  async signUp(dto: SignUpDto): Promise<SignUpRet> {
    const alreadyExists = await this.userPassRepo.getOneByUsername(dto.username);

    if (alreadyExists)
      throw new ConflictException("Username already exists");

    const insertingUser: UserDto = {
      email: dto.email,
      roles: [UserRoleName.DEFAULT],
      publicName: dto.username,
    };

    try {
      const insertedUser = await this.usersService.signUp(insertingUser);

      assertIsDefined(insertedUser);
      const insertingUserPass: UserPass = {
        userId: insertedUser.id,
        password: await hashPassword(dto.password),
        username: dto.username,
        createdAt: new Date(),
      };

      await this.userPassRepo.createOneAndGet(insertingUserPass);

      const userDto = insertedUser;

      this.appPayloadService.putUser(userDto);
      this.appPayloadService.persist();

      return {
        user: userDto,
        status: SignUpStatus.Success,
      };
    } catch (e) {
      if (e instanceof AlreadyExistsEmail) {
        const user = (await this.usersRepo.getOneByEmail(dto.email))!;
        const userId = user.id;
        const existingUserPass = await this.userPassRepo.getOneByUserId(userId);

        if (existingUserPass)
          throw new ConflictException();

        // TODO: comprobar la propiedad del email
        return {
          status: SignUpStatus.PendingEmail,
          user: null,
        };
      }

      throw e;
    }
  }

  private async getUserPassByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<UserPassEntityWithUserWithRoles | null> {
    const userPassByUsername = await this.userPassRepo.getOneByUsername(usernameOrEmail);

    if (userPassByUsername) {
      const user = await this.usersRepo.getOneById(userPassByUsername.userId, {
        expand: ["roles"],
      } ) as UserEntityWithRoles;

      assertIsDefined(user);

      return {
        ...userPassByUsername,
        user,
      };
    }

    return await this.getUserPassByEmail(usernameOrEmail);
  }

  private async getUserPassByEmail(
    email: string,
  ): Promise<UserPassEntityWithUserWithRoles | null> {
    const user = await this.usersRepo.getOneByEmail(email, {
      expand: ["roles"],
    } ) as UserEntityWithRoles | null;

    if (!user)
      return null;

    const userPass = await this.userPassRepo.getOneByUserId(
      user.id,
    ) as UserPassEntityWithUserWithRoles;

    if (!userPass)
      return null;

    userPass.user = user;

    return userPass;
  }

  async login(dto: LoginDto): Promise<UserPayload | null> {
    const { usernameOrEmail, password } = dto;
    let userPass = await this.getUserPassByUsernameOrEmail(usernameOrEmail);

    if (!userPass)
      return null;

    const isValid = await compare(password, userPass.password);

    if (!isValid)
      return null;

    this.appPayloadService.putUser(userPass.user);
    this.appPayloadService.persist();

    return userPass.user;
  }

  logout() {
    this.appPayloadService.removeUser();
    this.appPayloadService.persist();
  }

  info(): UserPayload | null {
    return this.appPayloadService.getUser();
  }
}
