import { PlayResourceMessage } from "#shared/models/player";
import { assertIsDefined, assertIsNotEmpty } from "#shared/utils/validation";
import fs from "node:fs";
import ProcessActions from "../../../PlayerProcessService";
import { MediaElement, QueuePlaylistManager } from "../../media";
import { VLCFlag, VLCProcess } from "../singleton";
import { episodeToMediaElement } from "./adapters";

export default class Service implements ProcessActions {
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

  isProcessOpen(): Promise<boolean> {
    return VLCProcess.isRunningAsync();
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

  async playResource( {resources: episodes, force}: PlayResourceMessage): Promise<boolean> {
    assertIsNotEmpty(episodes);

    const elements: MediaElement[] = episodes.map(episodeToMediaElement);

    this.#openNewInstance = force ?? false;
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

async function openVLC(file: string): Promise<VLCProcess> {
  const HTTP_PORT = process.env.VLC_HTTP_PORT ?? "8080";
  const HTTP_PASSWORD = process.env.VLC_HTTP_PASSWORD;

  assertIsDefined(HTTP_PASSWORD, "VLC_HTTP_PASSWORD");
  const vlcConfig = [
    VLCFlag.PLAY_AND_EXIT,
    VLCFlag.NO_VIDEO_TITLE,
    VLCFlag.ASPECT_RATIO, "16:9",
    VLCFlag.FULLSCREEN,
    VLCFlag.MINIMAL_VIEW,
    VLCFlag.NO_REPEAT,
    VLCFlag.NO_LOOP,
    VLCFlag.ONE_INSTANCE,
    VLCFlag.EXTRAINF, "http",
    VLCFlag.HTTP_PORT, HTTP_PORT,
    VLCFlag.HTTP_PASSWORD, HTTP_PASSWORD,
  ];
  const vlc = await VLCProcess.builder()
    .setFile(file)
    .addFlags(...vlcConfig)
    .buildAsync();

  return vlc;
}