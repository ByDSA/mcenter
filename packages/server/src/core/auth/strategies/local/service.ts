import { ConflictException, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { compare } from "bcryptjs";
import { assertIsDefined } from "$shared/utils/validation";
import { hashPassword } from "$shared/models/auth/local/utils";
import { AppPayloadService } from "../jwt/payload/AppPayloadService";
import { type UserPass, UserPassesRepository } from "./user-pass";
import { UserPassEntityWithUserWithRoles } from "./user-pass/userPass.entity";
import { LoginDto, SignUpDto } from "./dto";
import { LocalUserVerificationService } from "./verification.service";
import { assertFoundClient } from "#utils/validation/found";
import { User, UserEntityWithRoles, UserPayload } from "#core/auth/users/models";
import { AlreadyExistsEmailException } from "#core/auth/users/crud/repository/errors";
import { UsersService } from "#core/auth/users";
import { UsersRepository } from "#core/auth/users/crud/repository";

export enum SignUpStatus {
  EmailAlreadyExists = "email-already-exists",
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
    private readonly verificationService: LocalUserVerificationService,
  ) {
  }

  async signUp(dto: SignUpDto): Promise<SignUpRet> {
    try {
      let currentUser = await this.userPassRepo.getOneByUsername(dto.username);

      if (currentUser)
        throw new ConflictException("Username already exists");

      let currentUserPass = await this.usersRepo.getOneByEmail(dto.email);

      if (currentUserPass)
        throw new AlreadyExistsEmailException();

      const insertingUser: Omit<User, "roles"> = {
        email: dto.email,
        publicName: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        emailVerified: false,
      };
      const insertedUser = await this.usersService.signUp(insertingUser);

      assertIsDefined(insertedUser);
      const insertingUserPass: UserPass = {
        userId: insertedUser.id,
        passwordHash: await hashPassword(dto.password),
        username: dto.username,
        createdAt: new Date(),
        verificationToken: "will be generated",
      };

      await this.userPassRepo.createOneAndGet(insertingUserPass);

      return {
        user: insertedUser,
        status: SignUpStatus.PendingEmail,
      };
    } catch (e) {
      if (e instanceof AlreadyExistsEmailException) {
        return {
          status: SignUpStatus.EmailAlreadyExists,
          user: null,
        };
      }

      throw e;
    }
  }

  async requestNewToken(email: string) {
    const user = await this.usersRepo.getOneByEmail(email);

    assertFoundClient(user);

    const userPass = await this.userPassRepo.getOneByUserId(user.id);

    assertFoundClient(userPass);

    if (!userPass.verificationToken)
      throw new UnprocessableEntityException("Already verified email");

    await this.verificationService.sendVerificationMail( {
      mail: email,
      userPass: userPass,
      publicName: user.publicName ?? userPass.username,
    } );
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

    if (userPass?.verificationToken)
      throw new UnprocessableEntityException("Email not verified");

    if (!userPass)
      return null;

    const isValid = await compare(password, userPass.passwordHash);

    if (!isValid)
      return null;

    this.appPayloadService.login(userPass.user);

    return userPass.user;
  }

  async verifyEmail(token: string) {
    const userPass = await this.userPassRepo.getOneByVerificationToken(token);

    if (!userPass)
      throw new UnprocessableEntityException("Invalid token: " + token);

    await this.userPassRepo.patchOneByIdAndGet(userPass.id, {
      unset: [
        ["verificationToken"],
      ],
      entity: {},
    } );

    return userPass;
  }
}
