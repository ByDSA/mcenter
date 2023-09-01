import { assertIsDefined, assertIsNotEmpty } from "#utils/validation";
import fs from "node:fs";
import { VLCFlag, VLCProcess } from "./VLCProcess";
import { MediaElement, QueuePlaylistManager } from "./m3u";

type Options = {
  openNewInstance?: boolean;
};

export default class PlayerService {
  #queue: QueuePlaylistManager;

  #openNewInstance: boolean;

  #isRunningAnyInstance: boolean;

  constructor() {
    const { TMP_PATH } = process.env;

    assertIsDefined(TMP_PATH);

    if (!fs.existsSync(TMP_PATH))
      throw new Error(`TMP_PATH (${TMP_PATH}) does not exist`);

    this.#queue = new QueuePlaylistManager(TMP_PATH ?? "/");

    this.#openNewInstance = false;

    this.#isRunningAnyInstance = false;
  }

  async #closeIfNeeded(): Promise<boolean> {
    if (this.#openNewInstance || (this.#isRunningAnyInstance && this.#queue.nextNumber === 0))
      await VLCProcess.closeAllAsync();

    return true;
  }

  #setAsOpenIfNotRunning() {
    if (!this.#isRunningAnyInstance) {
      this.#openNewInstance = true;

      if (this.#queue.nextNumber > 0)
        this.#queue.clear();
    }
  }

  async #updateIsRunningAnyInstanceAsync() {
    const isRunning = await VLCProcess.isRunningAsync();

    this.#isRunningAnyInstance = isRunning;
  }

  async play(elements: MediaElement[], options?: Options): Promise<boolean> {
    assertIsNotEmpty(elements);

    this.#openNewInstance = options?.openNewInstance ?? false;
    await this.#updateIsRunningAnyInstanceAsync();
    console.log(`Play function: ${elements[0].path}`);

    await this.#closeIfNeeded();

    this.#setAsOpenIfNotRunning();

    this.#queue.add(...elements);

    if (this.#openNewInstance) {
      const file = this.#queue.firstFile;
      const vlcProcess = await openVLC(file);
      const okPromise: Promise<boolean> = new Promise((resolve) => {
        vlcProcess.onExit((code: number) => {
          if (code === 0)
            this.#queue.clear();

          console.log("Closed VLC");
          resolve(false);
        } );
        setTimeout(async () => {
          await this.#updateIsRunningAnyInstanceAsync();

          if (this.#isRunningAnyInstance)
            resolve(true);
          else
            resolve(false);
        }, 5 * 1000);
      } );
      const ok = await okPromise;

      return ok;
    }

    return true;
  }
}

const vlcConfig = [
  VLCFlag.PLAY_AND_EXIT,
  VLCFlag.NO_VIDEO_TITLE,
  VLCFlag.ASPECT_RATIO, "16:9",
  VLCFlag.FULLSCREEN,
  VLCFlag.MINIMAL_VIEW,
  VLCFlag.NO_REPEAT,
  VLCFlag.NO_LOOP,
  VLCFlag.ONE_INSTANCE];

async function openVLC(file: string): Promise<VLCProcess> {
  const vlc = await VLCProcess.builder()
    .setFile(file)
    .addFlags(...vlcConfig)
    .buildAsync();

  return vlc;
}