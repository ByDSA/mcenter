import { getDaysFrom } from "../date";
import { FuncParams } from "../Params";

// eslint-disable-next-line require-await
export default async function weightInitial( { self, history }: FuncParams): Promise<number> {
  const daysFromLastTime = history ? getDaysFrom(self, history) : 1;
  let reinforcementFactor = 1;
  const weight = self.weight ?? 0;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;
  else
    reinforcementFactor = 1;

  return reinforcementFactor ** 1.5 * daysFromLastTime; // TODO: pasar a db config
}
