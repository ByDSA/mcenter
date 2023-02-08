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

export function makeDir(folder: string) {
  return execPromisify(`mkdir ${folder}`);
}

export function makeDirIfNotExits(folder: string) {
  return execPromisify(`mkdir -p ${folder}`);
}

export function copyFile(from: string, to: string) {
  return execPromisify(`cp ${from} ${to}`);
}

export function moveFile(from: string, to: string) {
  return execPromisify(`mv ${from} ${to}`);
}

export function deleteFolder(folder: string) {
  return execPromisify(`rm -r ${folder}`);
}

export type CompressParams = {
  folder: string;
  outFile: string;
};

export function compress( { folder, outFile }: CompressParams) {
  return execPromisify(`tar -czf ${outFile} -C ${folder} .`)
    .then(() => {
      //   console.log(`Compressed ${folder} to ${outFile}`);
    } )
    .catch(() => false);
}

export type PgDumpParams = {
  file: string;
  host: string;
  pass?: string;
  user: string;
  db: string;
};

export function pgDump( { host, pass, user, db, file }: PgDumpParams) {
  let cmd = "";

  if (pass)
    cmd += `PGPASSWORD=${pass} `;

  cmd += `pg_dump -h ${host} -U ${user} -v -Fc ${db} > ${file}`;

  return execPromisify(cmd);
}
