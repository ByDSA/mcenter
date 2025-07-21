import { Serie, SerieEntity } from "../serie";

export function expectSerie(actual: Serie, expeted: Serie) {
  if (actual.name !== expeted.name && actual.key !== expeted.key)
    throw new Error(`Serie name mismatch: ${actual.name} !== ${expeted.name}`);
}

export function expectSerieEntity(actual: SerieEntity, expeted: SerieEntity) {
  if (actual._id !== expeted._id)
    throw new Error(`Serie id mismatch: ${actual._id} !== ${expeted._id}`);

  expectSerie(actual, expeted);
}
