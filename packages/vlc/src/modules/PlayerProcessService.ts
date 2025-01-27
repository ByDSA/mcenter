import { PlayResourceMessage } from "#modules/models";

export interface PlayerProcessService {
  playResource(params: PlayResourceMessage): Promise<boolean>;
  isProcessOpen(): Promise<boolean>;
}
