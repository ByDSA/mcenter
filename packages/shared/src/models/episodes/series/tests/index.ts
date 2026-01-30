import { Series, SeriesEntity } from "../serie";

export function expectSerie(actual: Series, expeted: Series) {
  if (actual.name !== expeted.name && actual.key !== expeted.key)
    throw new Error(`Serie name mismatch: ${actual.name} !== ${expeted.name}`);
}

export function expectSerieEntity(actual: SeriesEntity, expeted: SeriesEntity) {
  if (actual.id !== expeted.id)
    throw new Error(`Serie id mismatch: ${actual.id} !== ${expeted.id}`);

  expectSerie(actual, expeted);
}
