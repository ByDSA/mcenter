import { exec } from "child_process";
import util from 'util';

function treatAsUTC(date: Date) {
    let result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

export function daysBetween(startDate: Date, endDate: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate).getMilliseconds() - treatAsUTC(startDate).getMilliseconds()) / millisecondsPerDay;
}

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