import { CanActivate, ExecutionContext, Injectable, UseGuards } from "@nestjs/common";
import { AppPayloadService } from "../strategies/jwt";

@Injectable()
export class GuestOnlyGuard implements CanActivate {
  constructor(
    private readonly appPayloadService: AppPayloadService,
  ) {
  }

  canActivate(_context: ExecutionContext) {
    const user = this.appPayloadService.getCookieUser();

    return !user;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GuestOnly = () => UseGuards(GuestOnlyGuard);
