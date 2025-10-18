import { UserPayload, UserRoleName } from "./models";

export function isUser(user: UserPayload): boolean {
  return !!user.roles.find(r=>r.name === UserRoleName.USER);
}

export function isAdmin(user: UserPayload): boolean {
  return !!user.roles.find(r=>r.name === UserRoleName.ADMIN);
}
