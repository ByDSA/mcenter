import { PlayerStatusResponse, PlayResourceMessage } from "#modules/models";
import { PlayerProcessService } from "#modules/PlayerProcessService";
import { PlayerService as IPlayerService } from "#modules/PlayerService";
import { VLCWebInterface } from "../vlc/http-interface";
import { vlcResponsesToGenericResponses } from "./adapters";

type OnStatusChangeCallback = (status: PlayerStatusResponse)=> void;

type Params = {
  playerWebInterfaceService: VLCWebInterface;
  playerProcessService: PlayerProcessService;
};
export class PlayerService implements IPlayerService {
  #playerWebInterfaceService: VLCWebInterface;

  #playerProcessService: PlayerProcessService;

  #status: PlayerStatusResponse | null = null;

  #onStatusChangeListener: OnStatusChangeCallback | undefined;

  constructor( { playerWebInterfaceService, playerProcessService: playService }: Params) {
    this.#playerWebInterfaceService = playerWebInterfaceService;
    this.#playerProcessService = playService;

    const f = async () => {
      let nextTime = 100;

      try {
        if (await this.isRunning() || this.#status?.open) {
          this.#updateStatusOrFail()
            .catch(e=> { throw e; } );
        }
      } catch (error) {
        console.error(error);
        nextTime = 1000;
      }
      setTimeout(f, nextTime);
    };

    setTimeout(f, 100);
  }

  fullscreenToggle(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async toggleFullscreen(): Promise<void> {
    await this.#playerWebInterfaceService.fetchSecureToggleFullscreen();
  }

  onStatusChange(callback: OnStatusChangeCallback): void {
    this.#onStatusChangeListener = callback;
  }

  isRunning(): Promise<boolean> {
    return this.#playerProcessService.isProcessOpen();
  }

  async playResource(params: PlayResourceMessage) {
    await this.#playerProcessService.playResource(params);
  }

  async #updateStatusOrFail(): Promise<void> {
    const isVlcOpen = await this.isRunning();
    const vlcStatusPromise = this.#playerWebInterfaceService.fetchSecureShowStatus()
      .then((s) => s ?? undefined);
    const playlistPromise = this.#playerWebInterfaceService.fetchSecurePlaylist()
      .then(p => p ?? undefined);

    await Promise.all([vlcStatusPromise, playlistPromise]);

    this.#status = vlcResponsesToGenericResponses(
      isVlcOpen,
      await vlcStatusPromise,
      await playlistPromise,
    );
    this.#onStatusChangeListener?.(this.#status);
  }

  async pauseToggle() {
    const vlcResponse = await this.#playerWebInterfaceService.fetchSecureTogglePause();
    const response = vlcResponsesToGenericResponses(true, vlcResponse, undefined);

    this.#updateStatusWithVlcResponse(response);
  }

  async getPlaylist() {
    const ret = await this.#playerWebInterfaceService.fetchSecurePlaylist();

    return ret;
  }

  async next(): Promise<void> {
    await this.#playerWebInterfaceService.fetchSecureNext();
  }

  async previous(): Promise<void> {
    await this.#playerWebInterfaceService.fetchSecurePrevious();
  }

  async stop(): Promise<void> {
    await this.#playerWebInterfaceService.fetchSecureStop();
  }

  async seek(val: number | string): Promise<void> {
    if (typeof val === "number")

      val = Math.round(val);

    const vlcResponse = await this.#playerWebInterfaceService.fetchSecureSeek(val);
    const response = vlcResponsesToGenericResponses(true, vlcResponse, undefined);

    this.#updateStatusWithVlcResponse(response);
  }

  #updateStatusWithVlcResponse(response: PlayerStatusResponse) {
    const time = response?.status?.time;

    if (time !== undefined && this.#status?.status) {
      this.#status.status.time = Math.max(time, 0);
      this.#onStatusChangeListener?.(this.#status);
    }
  }

  async play(id: number): Promise<void> {
    await this.#playerWebInterfaceService.fetchPlay(id);
  }
}
