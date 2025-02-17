import fs from "node:fs";

export function readIfExistsSync(path: string) {
  return fs.existsSync(path) ? fs.readFileSync(path) : null;
}
