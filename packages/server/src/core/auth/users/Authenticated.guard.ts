import { Injectable, CanActivate, UnauthorizedException, ExecutionContext, applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { AppPayloadService } from "../strategies/jwt";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly appPayloadService: AppPayloadService,
  ) {
  }

  canActivate(_context: ExecutionContext) {
    const user = this.appPayloadService.getCookieUser();

    if (!user)
      throw new UnauthorizedException();

    return true;
  }
}

export const HAS_AUTHENTICATED_DECORATOR_KEY = "isAuthenticated";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Authenticated = () => {
  return applyDecorators(
    SetMetadata(HAS_AUTHENTICATED_DECORATOR_KEY, true),
    UseGuards(AuthenticatedGuard),
  );
};
