import crypto from "node:crypto";
import fs from "node:fs";

export function md5FileAsync(fullFilePath: string): Promise<string> {
  return new Promise((res, rej) => {
    const hash = crypto.createHash("md5");
    const rStream = fs.createReadStream(fullFilePath);

    rStream.on("data", (data) => {
      hash.update(data);
    } );
    rStream.on("error", (err) => {
      rej(err);
    } );
    rStream.on("end", () => {
      res(hash.digest("hex"));
    } );
  } );
}
