import { createHash, randomBytes } from "node:crypto";

export function generateRandomMD5(): string {
  const randomData = randomBytes(16).toString("hex");

  return createHash("md5").update(randomData)
    .digest("hex");
}

export const MD5_HASH = generateRandomMD5();
