import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppPayload } from "$shared/models/auth";
import { UsersRepository } from "#core/auth/users/crud/repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersRepository,
  ) {
    super( {
      jwtFromRequest: ExtractJwt.fromExtractors([getTokenFromRequest]),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_JWT_SECRET!,
      passReqToCallback: true,
    } );
  }

  async validate(req: Request, payload: AppPayload) {
    const id = payload.user?.id;

    if (!id)
      throw new UnauthorizedException();

    const user = await this.usersService.getOneById(id, {
      expand: ["roles"],
    } );

    (req as any).auth = {
      ...payload,
      user,
    };

    return null;
  }
}

function getTokenFromRequest(request: Request) {
  const token = request?.cookies[process.env.AUTH_COOKIE_NAME!];

  if (!token)
    return null;

  return token;
}
