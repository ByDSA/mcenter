/* eslint-disable import/prefer-default-export */
import bcrypt from "bcryptjs";

export function hash(plainPassword: string): string {
  const saltRounds = 11;
  const salt = bcrypt.genSaltSync(saltRounds);

  return bcrypt.hashSync(plainPassword, salt);
}

export function compareHash(plainPassword: string, hashStr: string): boolean {
  return bcrypt.compareSync(plainPassword, hashStr);
}
