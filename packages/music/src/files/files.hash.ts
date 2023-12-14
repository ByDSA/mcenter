/* eslint-disable import/prefer-default-export */
import sha256File from "sha256-file";

export function calcHashFromFile(filepath: string) {
  return sha256File(filepath);
}
