// @ts-check

export { cmd as sshCmd } from "./cmd.mjs";

import { assertEnv } from "../envs/index.mjs";

export function assertSshEnvs() {
  assertEnv("SSH_USER");
  assertEnv("SSH_HOST");
  assertEnv("SSH_KEYFILE");
}
