import { Player, PlayerStatusResponse } from "#modules/models";

export interface PlayerService extends Player {
  onStatusChange(callback: (status: PlayerStatusResponse)=> void): void;
}
