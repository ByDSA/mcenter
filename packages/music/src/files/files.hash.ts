/* eslint-disable import/prefer-default-export */
import crypto from "node:crypto";
import fs from "node:fs";

// TODO: esto es una copia de 'md5FileAsync' del package 'server'. Cuando se unan, quitar.
export function calcHashFromFile(fullFilePath: string): Promise<string> {
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
