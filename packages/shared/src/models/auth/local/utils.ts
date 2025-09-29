import { genSalt, hash } from "bcryptjs";

export async function hashPassword(password: string) {
  const salt = await genSalt(10);

  return hash(password, salt);
}
