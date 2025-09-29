import { applyDecorators, CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserPayload } from "../models";

const ROLES_KEY = "roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.getRolesFromDecorator(context);

    if (!requiredRoles)
      return true;

    const req = context.switchToHttp().getRequest();
    const user = req.auth?.user as UserPayload | undefined;

    if (!user?.roles)
      throw new UnauthorizedException();

    return user.roles.some((role) => requiredRoles.includes(role.name));
  }

  private getRolesFromDecorator(context: ExecutionContext): string[] {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    return roles;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: string[]) => applyDecorators(
  SetMetadata(ROLES_KEY, roles),
  UseGuards(RolesGuard),
);
