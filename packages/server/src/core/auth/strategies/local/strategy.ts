import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { Request } from "express";
import { UserPayload } from "$shared/models/auth";
import { assertIsDefined } from "$shared/utils/validation";
import { AuthCrudDtos } from "$shared/models/auth/dto/transport";
import { AuthLocalService } from "./service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger("LocalStrategy");

  constructor(
    private readonly moduleRef: ModuleRef,
  ) {
    super( {
      usernameField: AuthCrudDtos.LocalLogin.bodySchema.keyof().enum.usernameOrEmail,
      passwordField: AuthCrudDtos.LocalLogin.bodySchema.keyof().enum.password,
      passReqToCallback: true,
    } );
  }

  async validate(req: Request, usernameOrEmail: string, password: string): Promise<UserPayload> {
    // Instanciar AuthLocalService, que tiene de dependencia AppPayloadService (Request Scoped),
    // en JwtStrategy que no lo es
    const contextId = ContextIdFactory.create();

    this.moduleRef.registerRequestByContextId(req, contextId);
    const authService = await this.moduleRef.resolve(AuthLocalService, contextId);
    let user: UserPayload | null;

    try {
      user = await authService.login( {
        usernameOrEmail,
        password,
      } );

      assertIsDefined(user);
    } catch (e) {
      this.logger.log(e instanceof Error ? e.message : String(e));
      throw new UnauthorizedException();
    }

    return user;
  }
}
