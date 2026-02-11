import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-custom";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { UsersRepository } from "#core/auth/users/crud/repository";

export const STRATEGY_NAME = "token";

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
  constructor(
    private readonly usersRepo: UsersRepository,
  ) {
    super();
  }

  // req.user
  async validate(req: Request) {
    if (req.user)
      return req.user;

    const tokenParam = req.query?.token;

    if (!tokenParam)
      return null;

    const { success, data: token } = mongoDbId.safeParse(tokenParam);

    if (!success)
      return null;

    return await this.fetchUserByToken(token!);
  }

  private async fetchUserByToken(token: string) {
    return await this.usersRepo.getOneById(token);
  }
}
