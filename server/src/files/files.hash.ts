/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
import sha256File from "sha256-file";

export function calcHashFromFile(filepath: string) {
  return sha256File(filepath);
}
