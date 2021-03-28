import { exec } from "child_process";
import util from 'util';

export const isRunning = async (query: string): Promise<boolean> => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32': cmd = `tasklist`; break;
        case 'darwin': cmd = `ps -ax | grep ${query}`; break;
        case 'linux': cmd = `ps -A`; break;
        default: break;
    }

    const execPromisify = util.promisify(exec);
    const { stdout } = await execPromisify(cmd);
    return stdout.toLowerCase().indexOf(query.toLowerCase()) > -1;
}

export async function makeDir(folder: string) {
    return execPromisify(`mkdir ${folder}`);
}

export async function makeDirIfNotExits(folder: string) {
    return execPromisify(`mkdir -p ${folder}`);
}

export async function copyFile(from: string, to: string) {
    return execPromisify(`cp ${from} ${to}`);
}

export async function moveFile(from: string, to: string) {
    return execPromisify(`mv ${from} ${to}`);
}

export async function deleteFolder(folder: string) {
    return execPromisify(`rm -r ${folder}`);
}

export const execPromisify = util.promisify(exec);


export type CompressParams = {
    folder: string;
    outFile: string;
}

export async function compress({ folder, outFile }: CompressParams) {
    return execPromisify(`tar -czf ${outFile} -C ${folder} .`)
        .then(() => {
            console.log("Compressed " + folder + " to " + outFile);
        })
        .catch(() => false);
}

export type PgDumpParams = {
    file: string;
    host: string;
    pass?: string;
    user: string;
    db: string;
}

export async function pgDump({ host, pass, user, db, file }: PgDumpParams) {
    let cmd = "";
    if (pass)
        cmd += `PGPASSWORD=${pass} `;
    cmd += `pg_dump -h ${host} -U ${user} -v -Fc ${db} > ${file}`;
    return execPromisify(cmd);
}