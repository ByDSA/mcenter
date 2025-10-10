import { CanActivate, ExecutionContext, Injectable, UseGuards } from "@nestjs/common";

@Injectable()
export class GuestOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest();

    return !user;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GuestOnly = () => UseGuards(GuestOnlyGuard);
