import { Injectable, CanActivate, UnauthorizedException, applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: any) {
    try {
      const user = context.getRequest().auth?.user;

      assertIsDefined(user);
    } catch {
      throw new UnauthorizedException();
    }

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
