// @ts-check
import { assertEnv } from "../envs/index.mjs";

export { cmd as sshCmd } from "./cmd.mjs";

export function assertSshEnvs() {
  assertEnv("SSH_USER");
  assertEnv("SSH_HOST");
  assertEnv("SSH_KEYFILE");
}
