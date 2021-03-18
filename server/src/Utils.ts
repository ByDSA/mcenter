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