import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { AuthLocalService } from "./service";
import { localLoginBodySchema } from "./dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly moduleRef: ModuleRef) {
    super( {
      usernameField: localLoginBodySchema.keyof().enum.usernameOrEmail,
      passwordField: localLoginBodySchema.keyof().enum.password,
      passReqToCallback: true,
    } );
  }

  async validate(req: Request, usernameOrEmail: string, password: string): Promise<UserPayload> {
    const contextId = ContextIdFactory.create();

    this.moduleRef.registerRequestByContextId(req, contextId);
    const authService = await this.moduleRef.resolve(AuthLocalService, contextId);
    const user = await authService.login( {
      usernameOrEmail,
      password,
    } );

    if (!user)
      throw new UnauthorizedException();

    return user;
  }
}
