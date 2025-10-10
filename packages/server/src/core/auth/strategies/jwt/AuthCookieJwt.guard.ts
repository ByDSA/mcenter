import { Injectable, ExecutionContext, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtGuard extends AuthGuard("jwt") {
  handleRequest<UserPayload>(err: any, user: UserPayload, _info: any, _context: ExecutionContext) {
    if (err || !user)
      return null;

    return user;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const OptionalJwt = ()=> UseGuards(OptionalJwtGuard);
