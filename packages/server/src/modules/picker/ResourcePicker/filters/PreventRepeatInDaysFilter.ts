import { PreventRepeatInTimeFilter } from "#modules/picker";

type Params = {
  minDays: number;
  lastTimePlayed: number;
};
export default class PreventRepeatInDaysFilter extends PreventRepeatInTimeFilter {
  constructor(params: Params) {
    super( {
      lastTimePlayed: params.lastTimePlayed,
      minSecondsElapsed: params.minDays * 24 * 60 * 60,
    } );
  }
}