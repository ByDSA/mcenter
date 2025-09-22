import { CanActivate, ExecutionContext, Injectable, UseGuards } from "@nestjs/common";
import { AppPayloadService } from "../strategies/jwt";

@Injectable()
export class GuestOnlyGuard implements CanActivate {
  constructor(private readonly appPayloadService: AppPayloadService) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext) {
    const user = this.appPayloadService.getUser();

    return !user;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GuestOnly = () => UseGuards(GuestOnlyGuard);
