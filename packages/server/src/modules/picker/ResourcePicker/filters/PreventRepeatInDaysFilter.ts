import { SECONDS_IN_DAY } from "#modules/resources";
import PreventRepeatInTimeFilter from "./PreventRepeatInTimeFilter";

type Params = {
  minDays: number;
};

export default class PreventRepeatInDaysFilter extends PreventRepeatInTimeFilter {
  constructor(params: Params) {
    super( {
      minSecondsElapsed: params.minDays * SECONDS_IN_DAY,
    } );
  }
}