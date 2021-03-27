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

export async function createFolder(folder: string): Promise<Boolean> {
    return execPromisify(`mkdir ${folder}`)
        .then(() => true)
        .catch(() => false);
}

export async function copyFile(from: string, to: string) {
    return execPromisify(`cp ${from} ${to}`)
        .then(() => true)
        .catch(() => false);
}

export async function moveFile(from: string, to: string) {
    return execPromisify(`mv ${from} ${to}`)
        .then(() => true)
        .catch(() => false);
}

export async function deleteFolder(folder: string) {
    return execPromisify(`rm -r ${folder}`)
        .then(() => true)
        .catch(() => false);
}

export const execPromisify = util.promisify(exec);