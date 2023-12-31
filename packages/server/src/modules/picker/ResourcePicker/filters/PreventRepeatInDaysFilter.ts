import PreventRepeatInTimeFilter from "./PreventRepeatInTimeFilter";

type Params = {
  minDays: number;
};
export const SECONDS_IN_DAY = 24 * 60 * 60;

export default class PreventRepeatInDaysFilter extends PreventRepeatInTimeFilter {
  constructor(params: Params) {
    super( {
      minSecondsElapsed: params.minDays * SECONDS_IN_DAY,
    } );
  }
}