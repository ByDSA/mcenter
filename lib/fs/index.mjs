import fs from "node:fs";

export function assertFileExists(file) {
  if (!fs.existsSync(file)) {
    console.log(`${file} file does not exist`);
    process.exit(1);
  }
}
