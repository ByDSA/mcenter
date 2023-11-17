import { PlaylistResponse, StatusResponse } from "#shared/models/vlc";

export default interface Interface {
  isVlcRunning(): Promise<boolean>;
  fetchSecureShowStatus(): Promise<StatusResponse | undefined>;
  fetchSecurePlaylist(): Promise<PlaylistResponse | undefined>;
  fetchSecureTogglePause(): Promise<StatusResponse | null>;
  fetchSecureNext(): Promise<void>;
  fetchSecurePrevious(): Promise<void>;
  fetchSecureStop(): Promise<void>;
  fetchSecureToggleFullscreen(): Promise<void>;
  fetchSecureSeek(val: number | string): Promise<StatusResponse | null>;
  fetchPlay(id: number): Promise<void>;
}