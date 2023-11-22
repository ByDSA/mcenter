import { PlayResourceMessage } from "#shared/models/player";

export default interface ProcessActions {
  playResource(params: PlayResourceMessage): Promise<boolean>;
  isProcessOpen(): Promise<boolean>;
}