// eslint-disable-next-line import/prefer-default-export
export async function md5HashOfFile(path: string): Promise<string> {
  const {createHash} = await import("crypto");
  const {createReadStream} = await import("node:fs");

  return new Promise((resolve, reject) => {
    const hash = createHash("md5");
    const stream = createReadStream(path);

    stream.on("error", (err) => {
      reject(err);
    } );
    stream.on("data", (chunk) => {
      hash.update(chunk);
    } );
    stream.on("end", () => {
      resolve(hash.digest("hex"));
    } );
  } );
}