/* eslint-disable max-classes-per-file */
import { execAndWaitUntilStarted, isRunning, killAll, killProcessByPid } from "#utils/process";
import * as cp from "child_process";

export enum VLCFlag {
    PLAY_AND_EXIT = "--play-and-exit",
    NO_VIDEO_TITLE = "--no-video-title-show",
    ASPECT_RATIO = "--aspect-ratio",
    FULLSCREEN = "-f",
    MINIMAL_VIEW = "--qt-minimal-view",
    NO_REPEAT = "--no-repeat",
    NO_LOOP = "--no-loop",
    ONE_INSTANCE = "--one-instance",
    EXTRAINF = "--extraintf",
    HTTP_PORT = "--http-port",
    HTTP_PASSWORD = "--http-password"
}

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