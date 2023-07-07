/* eslint-disable no-await-in-loop */
/* eslint-disable require-await */
import * as cp from "child_process";
import { execAndWaitUntilStarted, killAll, killProcessByPid } from "#modules/utils";

export enum VLCFlag {
    PLAY_AND_EXIT = "--play-and-exit",
    NO_VIDEO_TITLE = "--no-video-title-show",
    ASPECT_RATIO = "--aspect-ratio",
    FULLSCREEN = "-f",
    MINIMAL_VIEW = "--qt-minimal-view",
    NO_REPEAT = "--no-repeat",
    NO_LOOP = "--no-loop",
    ONE_INSTANCE = "--one-instance"
}

const PROCESS_NAME = "vlc";

export class VLC {
  private guardProcess(): cp.ChildProcess {
    if (!this.process)
      throw new Error("No hay proceso VLC");

    return this.process;
  }

  close() {
    const p = this.guardProcess();

    if (p.pid === undefined)
      throw new Error("No hay PID");

    const pid = p.pid + 1; // No sé por qué es +1

    return killProcessByPid(pid);
  }

  private process?: cp.ChildProcess;

  private flags: string[] = [];

  openFileAsync(file: string) {
    return this.commonOpenAsync(file);
  }

  openAsync() {
    return this.commonOpenAsync();
  }

  private async commonOpenAsync(file: string = "") {
    const args = this.flags.join(" ");

    console.log(`Open VLC: ${args}`);
    this.process = await execAndWaitUntilStarted(`"${PROCESS_NAME}" ${file} ${args}`);
  }

  config(...flags: string[]) {
    this.flags = flags;
  }

  static async closeAllAsync() {
    return killAll(PROCESS_NAME);
  }

  on(name: string, f: (code: number)=> void) {
    const p = this.guardProcess();

    p.on(name, f);
  }
}