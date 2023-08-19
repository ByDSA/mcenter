/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-await-in-loop */
import dotenv from "dotenv";
import { MediaElement, QueuePlaylistManager, VLCFlag, VLCProcess } from "./player";

dotenv.config();
const { TMP_PATH } = process.env;

type Options = {
  openNewInstance?: boolean;
};

export default class PlayService {
  #queue: QueuePlaylistManager;

  #openNewInstance: boolean;

  #isRunningAnyInstance: boolean;

  constructor() {
    this.#queue = new QueuePlaylistManager(TMP_PATH || "/");

    this.#openNewInstance = false;

    this.#isRunningAnyInstance = false;
  }

  async #closeIfNeeded() {
    if (this.#openNewInstance || (this.#isRunningAnyInstance && this.#queue.nextNumber === 0))
      await VLCProcess.closeAllAsync();
  }

  #setAsOpenIfNotRunning() {
    if (!this.#isRunningAnyInstance) {
      this.#openNewInstance = true;

      if (this.#queue.nextNumber > 0)
        this.#queue.clear();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async play(elements: MediaElement[], options?: Options) {
    if (elements.length === 0)
      throw new Error("No elements to play");

    this.#openNewInstance = options?.openNewInstance ?? false;
    this.#isRunningAnyInstance = await VLCProcess.isRunningAsync();
    console.log(`Play function: ${elements[0].path}`);

    await this.#closeIfNeeded();

    this.#setAsOpenIfNotRunning();

    this.#queue.add(...elements);

    if (this.#openNewInstance) {
      const file = this.#queue.firstFile;
      const vlcProcess = await openVLC(file);

      vlcProcess.onExit((code: number) => {
        if (code === 0)
          this.#queue.clear();

        console.log("Closed VLC");
      } );
    }
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