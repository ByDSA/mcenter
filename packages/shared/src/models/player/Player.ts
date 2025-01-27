import { Episode } from "../episodes";

export type PlayResourceParams = {
  force?: boolean;
  resources: Episode[];
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

export interface PlayerService extends PlayerActions {
  isRunning(): Promise<boolean>;
}
