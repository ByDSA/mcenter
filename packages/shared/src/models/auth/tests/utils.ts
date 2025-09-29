import { genSaltSync, hashSync } from "bcryptjs";

export function hashPasswordSync(password: string) {
  const salt = genSaltSync(10);

  return hashSync(password, salt);
}
