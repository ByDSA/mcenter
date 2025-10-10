/* eslint-disable @typescript-eslint/naming-convention */
import { applyDecorators, CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserPayload, UserRoleName } from "../models";

const ROLES_KEY = "roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as UserPayload | undefined;

    if (!user?.roles)
      throw new UnauthorizedException();

    const requiredRoles = this.getRolesFromDecorator(context);

    if (!requiredRoles)
      return true;

    return user.roles.some((role) => requiredRoles.includes(role.name));
  }

  private getRolesFromDecorator(context: ExecutionContext): UserRoleName[] {
  // getAllAndMerge combina los roles del controller y del handler
    const roles = this.reflector.getAllAndMerge<UserRoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return roles || [];
  }
}

export const Roles = (...roles: UserRoleName[]) => applyDecorators(
  SetMetadata(ROLES_KEY, roles),
  UseGuards(RolesGuard),
);

export const IsAdmin = () => Roles(UserRoleName.ADMIN);
