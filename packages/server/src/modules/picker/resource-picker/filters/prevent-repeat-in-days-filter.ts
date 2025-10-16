import { SECONDS_IN_DAY } from "#modules/resources";
import { PreventRepeatInTimeFilter } from "./prevent-repeat-in-time-filter";

type Params = {
  minDays: number;
};

export abstract class PreventRepeatInDaysFilter<R> extends PreventRepeatInTimeFilter<R> {
  constructor(params: Params) {
    super( {
      minSecondsElapsed: params.minDays * SECONDS_IN_DAY,
    } );
  }
}
