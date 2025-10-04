import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppPayload } from "$shared/models/auth";
import { ModuleRef, ContextIdFactory } from "@nestjs/core";
import { AppPayloadService } from "./payload/AppPayloadService";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) {
    super( {
      jwtFromRequest: ExtractJwt.fromExtractors([getTokenFromRequest]),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_JWT_SECRET!,
      passReqToCallback: true,
    } );
  }

  async validate(req: Request, payload: AppPayload) {
    if (!payload.user)
      throw new UnauthorizedException();

    // Instanciar AppPayloadService que es Request Scoped
    // en JwtStrategy que no lo es
    const contextId = ContextIdFactory.create();

    this.moduleRef.registerRequestByContextId(req, contextId);
    const appPayloadService = await this.moduleRef.resolve(
      AppPayloadService,
      contextId,
    );

    await appPayloadService.refreshUser(payload.user);

    return null;
  }
}

function getTokenFromRequest(request: Request) {
  const token = request?.cookies[process.env.AUTH_COOKIE_NAME!];

  if (!token)
    return null;

  return token;
}
