import { Params } from "../GroupPicker";

// eslint-disable-next-line require-await
export default async function f( { self, picker }: Params): Promise<number> {
  const weight = picker.getWeight(self) || 1;

  return Math.min(weight, Number.MAX_SAFE_INTEGER / picker.data.length);
}
