import { exec, execSync } from "child_process";
import { isRunning } from "../../../actions/utils/Utils";

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

export default class VLC {
    private process: any | undefined;

    private flags: string[] = [];

    async open(file: string) {
      const args = this.flags.join(" ");

      console.log(`Open VLC: ${args}`);
      this.process = exec(`"vlc" ${file} ${args}`);
    }

    config(...flags: string[]) {
      this.flags = flags;
    }

    async close() {
      // TODO
    }

    static async closeAll() {
      while (await isRunning("vlc")) {
        try {
          console.log("Closing VLC...");
          execSync("killall vlc");
        } catch (e) {
          console.log("Error closing VLC");
          break;
        }
      }
    }

    on(name: string, f: (code: number)=> void) {
      this.process.on(name, f);
    }
}
