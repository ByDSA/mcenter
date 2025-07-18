import * as cp from "child_process";
import { execAndWaitUntilStarted, isRunning, killAll, killProcessByPid } from "$shared/utils/process";

type OnHandler = (code: number)=> void;

const PROCESS_NAME = "vlc";

class VLCProcessBuilder {
  #flags: string[] = [];

  #file: string | undefined;

  addFlags(...flags: string[]) {
    this.#flags.push(...flags);

    return this;
  }

  setFile(file: string) {
    this.#file = file;

    return this;
  }

  async buildAsync(): Promise<VLCProcess> {
    const args = this.#flags.join(" ");

    console.log(`Open VLC: ${args}`);
    const process = await execAndWaitUntilStarted(`"${PROCESS_NAME}" ${this.#file} ${args}`);

    return new (VLCProcess as any)(process);
  }
}

export class VLCProcess {
  #process: cp.ChildProcess;

  private constructor(process: cp.ChildProcess) {
    this.#process = process;
  }

  static builder(): VLCProcessBuilder {
    return new VLCProcessBuilder();
  }

  close() {
    if (this.#process.pid === undefined)
      throw new Error("No hay PID");

    const pid = this.#process.pid + 1; // No sé por qué es +1

    return killProcessByPid(pid);
  }

  // eslint-disable-next-line require-await
  static async closeAllAsync() {
    return killAll(PROCESS_NAME);
  }

  static isRunningAsync() {
    return isRunning(PROCESS_NAME);
  }

  #on(name: string, f: OnHandler) {
    this.#process.on(name, f);
  }

  onExit(f: OnHandler) {
    this.#on("exit", f);
  }
}
