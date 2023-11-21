import { Player, PlayerStatusResponse } from "#shared/models/player";

export default interface PlayerService extends Player {
  onStatusChange(callback: (status: PlayerStatusResponse)=> void): void;
}