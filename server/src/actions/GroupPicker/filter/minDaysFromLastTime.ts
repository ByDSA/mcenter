import { getDaysFrom } from "../date";
import { FuncParams } from "../Params";

export default function preventRepeatInDays(minDays: number) {
  return ( { self, history }: FuncParams): boolean => {
    if (!history)
      return true;

    const daysFromLastTime = getDaysFrom(self, history);

    return daysFromLastTime >= minDays;
  };
}
