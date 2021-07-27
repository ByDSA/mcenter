import { getDaysFrom } from "../filter";
import { Params } from "../GroupPicker";

// eslint-disable-next-line require-await
export default async function weightInitial( { self, history }: Params): Promise<number> {
  const daysFromLastTime = getDaysFrom(self, history);
  let reinforcementFactor = 1;
  const { weight } = self;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;
  else
    reinforcementFactor = 1;

  return reinforcementFactor ** 1.5 * daysFromLastTime; // TODO: pasar a db config
}
