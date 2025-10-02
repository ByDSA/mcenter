import { UserEntityWithRoles, UserRoleName } from "./models";

export function isUser(user: UserEntityWithRoles): boolean {
  return !!user.roles.find(r=>r.name === UserRoleName.USER);
}

export function isAdmin(user: UserEntityWithRoles): boolean {
  return !!user.roles.find(r=>r.name === UserRoleName.ADMIN);
}
