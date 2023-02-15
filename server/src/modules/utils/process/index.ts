import find from "find-process";
import * as cp from "node:child_process";
import { exec } from "node:child_process";
import util from "node:util";

export const execPromisify = util.promisify(exec);

export function execAndWaitUntilStarted(command: string): Promise<cp.ChildProcess> {
  return new Promise((resolve) => {
    const process = exec(command);
    const interval = setInterval(() => {
      if (process.pid) {
        clearInterval(interval);
        resolve(process);
      }
    }, 1);
  } );
}

export const isRunning = (query: string): Promise<boolean> =>
  find("name", query, true).then((list: any[]) => list.length !== 0);

export function killProcessByPid(pid: number) {
  return exec(`sudo kill ${pid} -9`);
}

export async function killAll(query: string) {
  const list = await find("name", query, true);

  list.forEach((p) => {
    process.kill(p.pid, 9);
  } );
}