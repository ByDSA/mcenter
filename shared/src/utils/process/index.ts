import find from "find-process";
import * as cp from "node:child_process";
import { exec, execSync } from "node:child_process";
import util from "node:util";

export const execPromisify = util.promisify(exec);

export function execAndWaitUntilStarted(command: string): Promise<cp.ChildProcess> {
  return new Promise((resolve, reject) => {
    const process = exec(command);
    let times = 0;
    const maxTimes = 10;
    const interval = setInterval(() => {
      if (process.pid) {
        clearInterval(interval);
        resolve(process);
      }

      times++;

      if (times > maxTimes) {
        clearInterval(interval);
        reject();
      }
    }, 1);
  } );
}

export const isRunning = (query: string): Promise<boolean> => {
  const cmd = `pgrep ${query} || true`;
  const pids = execSync(cmd, {
    stdio: ["ignore", "pipe", "pipe"],
  } ).toString()
    .trim()
    .split("\n")
    .filter((pid) => pid !== "");

  return Promise.resolve(pids.length > 0);
};

export function killProcessByPid(pid: number) {
  return exec(`sudo kill ${pid} -9`);
}

export async function killAll(query: string) {
  const list = await find("name", query, true);

  list.forEach((p) => {
    process.kill(p.pid, 9);
  } );
}