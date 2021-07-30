import { exec } from "child_process";
import util from "util";

export const execPromisify = util.promisify(exec);

export const isRunning = async (query: string): Promise<boolean> => {
  const { platform } = process;
  let cmd = "";

  switch (platform) {
    case "win32": cmd = "tasklist";
      break;
    case "darwin": cmd = `ps -ax | grep ${query}`;
      break;
    case "linux": cmd = "ps -A";
      break;
    default: break;
  }

  const { stdout } = await execPromisify(cmd);

  return stdout.toLowerCase().indexOf(query.toLowerCase()) > -1;
};

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
}

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
}

export function pgDump( { host, pass, user, db, file }: PgDumpParams) {
  let cmd = "";

  if (pass)
    cmd += `PGPASSWORD=${pass} `;

  cmd += `pg_dump -h ${host} -U ${user} -v -Fc ${db} > ${file}`;

  return execPromisify(cmd);
}
