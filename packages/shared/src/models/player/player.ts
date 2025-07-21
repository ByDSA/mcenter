import { MediaElement } from "./media-element/media-element";

export type PlayResourceParams = {
  force?: boolean;
  mediaElements: MediaElement[];
};

export interface PlayerActions {
  playResource(params: PlayResourceParams): Promise<void>;
  play(id: number): Promise<void>;
  pauseToggle(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  stop(): Promise<void>;
  fullscreenToggle(): Promise<void>;
  seek(value: number | string): Promise<void>;
}

export interface Player extends PlayerActions {
  isRunning(): Promise<boolean>;
}
