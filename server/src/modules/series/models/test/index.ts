import Model from "../Serie";

export function expectSerie(serie1: Model, serie2: Model) {
  if (serie1.id !== serie2.id)
    throw new Error(`Serie id mismatch: ${serie1.id} !== ${serie2.id}`);

  if (serie1.name !== serie2.name)
    throw new Error(`Serie name mismatch: ${serie1.name} !== ${serie2.name}`);
}