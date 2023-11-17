import { PlaylistResponse, StatusResponse } from "#shared/models/vlc";
import Interface from "./VlcBackService";
import VlcBackWebSocketsServerService from "./VlcBackWebSocketsServerService";

type Params = {
  vlcBackWebSocketsServerService: VlcBackWebSocketsServerService;
};
export default class Imp implements Interface {
  #vlcBackWebSocketsServerService: VlcBackWebSocketsServerService;

  constructor( {vlcBackWebSocketsServerService}: Params) {
    this.#vlcBackWebSocketsServerService = vlcBackWebSocketsServerService;
  }

  isVlcRunning(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  fetchSecureShowStatus(): Promise<StatusResponse | undefined> {
    throw new Error("Method not implemented.");
  }

  fetchSecurePlaylist(): Promise<PlaylistResponse | undefined> {
    throw new Error("Method not implemented.");
  }

  fetchSecureTogglePause(): Promise<StatusResponse | null> {
    throw new Error("Method not implemented.");
  }

  fetchSecureNext(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fetchSecurePrevious(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fetchSecureStop(): Promise<void>{
    throw new Error("Method not implemented.");
  }

  fetchSecureToggleFullscreen(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fetchSecureSeek(val: number | string): Promise<StatusResponse | null> {
    throw new Error("Method not implemented.");
  }

  fetchPlay(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}