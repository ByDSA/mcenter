import { Injectable, CanActivate, UnauthorizedException, applyDecorators, SetMetadata, UseGuards, ExecutionContext } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    try {
      const { user } = context.switchToHttp().getRequest();

      assertIsDefined(user);
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}

export const HAS_AUTHENTICATED_DECORATOR_KEY = "isAuthenticated";

export const Authenticated = () => {
  return applyDecorators(
    SetMetadata(HAS_AUTHENTICATED_DECORATOR_KEY, true),
    UseGuards(AuthenticatedGuard),
  );
};
