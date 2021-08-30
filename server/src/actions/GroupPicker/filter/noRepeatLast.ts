import { getLastItemFromHistory } from "../../../db/models/history";
import { FuncParams } from "../Params";

export default function preventRepeatLast( { self, history }: FuncParams) {
  if (!history)
    return true;

  const lastItem = getLastItemFromHistory(history);

  return !lastItem || lastItem.idResource !== self.id;
}
