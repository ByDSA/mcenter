import { Serie } from "../Serie";

export function expectSerie(serie1: Serie, serie2: Serie) {
  if (serie1.id !== serie2.id)
    throw new Error(`Serie id mismatch: ${serie1.id} !== ${serie2.id}`);

  if (serie1.name !== serie2.name)
    throw new Error(`Serie name mismatch: ${serie1.name} !== ${serie2.name}`);
}
