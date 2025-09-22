export enum UserRoleName {
  ADMIN = "admin",
  USER = "user",
  DEFAULT = USER,
}

const ROLE_VALUES = Object.freeze(Object.values(UserRoleName));

export function parseUserRole(role: string): UserRoleName {
  if (!ROLE_VALUES.includes(role as UserRoleName)) {
    throw new Error(
      `Invalid role: ${role}. Expected one of: ${ROLE_VALUES.join(", ")}`,
    );
  }

  return role as UserRoleName;
}
