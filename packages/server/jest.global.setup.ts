import { join } from "node:path";
import { execSync } from "node:child_process";

export default function fn () {
try {
  execSync(join(__dirname, "bin", "fix-logs.mjs"), {
    stdio: "inherit",
  } );
} catch (error) {
  console.error("Error limpiando logs:", error);
}
}